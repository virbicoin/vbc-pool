package api

import (
	"encoding/json"
	"fmt"
	"log"
	"math/big"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/virbicoin/vbc-pool/rpc"
	"github.com/virbicoin/vbc-pool/storage"
	"github.com/virbicoin/vbc-pool/util"
)

type FaucetConfig struct {
	Enabled         bool     `json:"enabled"`
	Amount          int64    `json:"amount"`          // Amount in wei (1e18 = 1 coin)
	CooldownMinutes int64    `json:"cooldownMinutes"` // Cooldown per address in minutes
	MaxDailyPerIP   int      `json:"maxDailyPerIP"`   // Max requests per IP per day
	Address         string   `json:"address"`         // Faucet wallet address
	Daemon          string   `json:"daemon"`          // RPC endpoint
	Timeout         string   `json:"timeout"`
	Gas             string   `json:"gas"`
	GasPrice        string   `json:"gasPrice"`
	AutoGas         bool     `json:"autoGas"`
	AllowedOrigins  []string `json:"allowedOrigins"` // CORS allowed origins (empty = allow all)
	TrustProxy      bool     `json:"trustProxy"`     // Trust X-Forwarded-For header
	Symbol          string   `json:"symbol"`         // Coin symbol (e.g., "VBC")
}

type FaucetServer struct {
	config  *FaucetConfig
	backend *storage.RedisClient
	rpc     *rpc.RPCClient

	// Rate limiting
	ipRequests     map[string]*ipRequestInfo
	ipRequestsMu   sync.RWMutex
	addrCooldowns  map[string]int64
	addrCooldownMu sync.RWMutex

	// Statistics
	totalRequests   int64
	totalSent       *big.Int // in wei (use big.Int to avoid int64 overflow)
	uniqueAddresses map[string]bool
	statsMu         sync.RWMutex
}

type ipRequestInfo struct {
	count     int
	resetTime int64
}

type FaucetRequest struct {
	Address string `json:"address"`
	IP      string `json:"ip"`
}

type FaucetResponse struct {
	Success           bool   `json:"success"`
	Message           string `json:"message,omitempty"`
	Error             string `json:"error,omitempty"`
	TxHash            string `json:"txHash,omitempty"`
	Amount            int64  `json:"amount,omitempty"`
	AmountFormatted   string `json:"amountFormatted,omitempty"`
	Symbol            string `json:"symbol,omitempty"`
	RemainingRequests int    `json:"remainingRequests,omitempty"`
	CooldownSeconds   int64  `json:"cooldownSeconds,omitempty"`
}

func NewFaucetServer(cfg *FaucetConfig, backend *storage.RedisClient) *FaucetServer {
	f := &FaucetServer{
		config:          cfg,
		backend:         backend,
		ipRequests:      make(map[string]*ipRequestInfo),
		addrCooldowns:   make(map[string]int64),
		totalSent:       big.NewInt(0),
		uniqueAddresses: make(map[string]bool),
	}
	if cfg.Enabled {
		f.rpc = rpc.NewRPCClient("Faucet", cfg.Daemon, cfg.Timeout)
		// Load persistent statistics from Redis
		f.loadStats()
		// Start cleanup goroutine to prevent memory leaks
		go f.cleanupLoop()
	}
	return f
}

// cleanupLoop periodically removes expired entries from rate limiting maps
func (f *FaucetServer) cleanupLoop() {
	ticker := time.NewTicker(1 * time.Hour)
	defer ticker.Stop()

	for range ticker.C {
		f.cleanupExpiredEntries()
	}
}

// cleanupExpiredEntries removes old IP and address entries
func (f *FaucetServer) cleanupExpiredEntries() {
	now := time.Now().Unix()
	dayStart := now - (now % 86400)

	// Cleanup IP requests
	f.ipRequestsMu.Lock()
	for ip, info := range f.ipRequests {
		if info.resetTime < dayStart {
			delete(f.ipRequests, ip)
		}
	}
	f.ipRequestsMu.Unlock()

	// Cleanup address cooldowns
	cooldownSeconds := f.config.CooldownMinutes * 60
	f.addrCooldownMu.Lock()
	for addr, lastRequest := range f.addrCooldowns {
		if now-lastRequest > cooldownSeconds {
			delete(f.addrCooldowns, addr)
		}
	}
	f.addrCooldownMu.Unlock()

	log.Printf("Faucet cleanup: IP entries=%d, Address entries=%d", len(f.ipRequests), len(f.addrCooldowns))
}

func (f *FaucetServer) GetStatus(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	f.setCORSHeaders(w, r)
	w.Header().Set("Cache-Control", "no-cache")
	w.WriteHeader(http.StatusOK)

	reply := map[string]interface{}{
		"enabled": f.config.Enabled,
	}
	if f.config.Enabled {
		reply["amount"] = f.config.Amount
		reply["cooldownMinutes"] = f.config.CooldownMinutes
		reply["symbol"] = f.config.Symbol
		reply["maxDailyPerIP"] = f.config.MaxDailyPerIP

		// Format amount for display (convert from wei to coins)
		amountBig := big.NewInt(f.config.Amount)
		reply["amountFormatted"] = formatWeiToCoins(amountBig)

		// Add statistics
		f.statsMu.RLock()
		reply["stats"] = map[string]interface{}{
			"totalRequests":      f.totalRequests,
			"totalSent":          f.totalSent.String(),
			"totalSentFormatted": formatWeiToCoins(f.totalSent),
			"uniqueAddresses":    len(f.uniqueAddresses),
		}
		f.statsMu.RUnlock()

		// Get faucet wallet balance
		if f.rpc != nil {
			balance, err := f.rpc.GetBalance(f.config.Address)
			if err == nil {
				reply["balance"] = balance.String() // Use string to avoid int64 overflow
				reply["balanceFormatted"] = formatWeiToCoins(balance)
			}
		}
	}

	json.NewEncoder(w).Encode(reply)
}

// formatWeiToCoins converts wei (big.Int) to human-readable coin format
func formatWeiToCoins(wei *big.Int) string {
	if wei == nil || wei.Sign() <= 0 {
		return "0"
	}
	// 1 coin = 1e18 wei
	ether := new(big.Float).SetInt(wei)
	divisor := new(big.Float).SetInt(big.NewInt(1e18))
	result := new(big.Float).Quo(ether, divisor)

	// Format with appropriate precision
	f64, _ := result.Float64()
	if f64 >= 1000 {
		return fmt.Sprintf("%.2f", f64)
	} else if f64 >= 1 {
		return fmt.Sprintf("%.4f", f64)
	} else if f64 >= 0.0001 {
		return fmt.Sprintf("%.6f", f64)
	}
	return fmt.Sprintf("%.8f", f64)
}

// setCORSHeaders sets appropriate CORS headers based on configuration
func (f *FaucetServer) setCORSHeaders(w http.ResponseWriter, r *http.Request) {
	origin := r.Header.Get("Origin")
	if len(f.config.AllowedOrigins) == 0 {
		// No restriction configured, allow all (development mode)
		w.Header().Set("Access-Control-Allow-Origin", "*")
	} else {
		// Check if origin is in allowed list
		for _, allowed := range f.config.AllowedOrigins {
			if origin == allowed {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Vary", "Origin")
				break
			}
		}
	}
}

func (f *FaucetServer) HandleRequest(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	f.setCORSHeaders(w, r)
	w.Header().Set("Cache-Control", "no-cache")

	// Handle CORS preflight
	if r.Method == "OPTIONS" {
		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != "POST" {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(FaucetResponse{Error: "Method not allowed"})
		return
	}

	if !f.config.Enabled {
		w.WriteHeader(http.StatusServiceUnavailable)
		json.NewEncoder(w).Encode(FaucetResponse{Error: "Faucet is disabled"})
		return
	}

	// Limit request body size to prevent DoS (max 1KB)
	r.Body = http.MaxBytesReader(w, r.Body, 1024)

	// Parse request
	var req FaucetRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(FaucetResponse{Error: "Invalid request body"})
		return
	}

	// Validate address
	address := strings.ToLower(req.Address)
	if !util.IsValidHexAddress(address) {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(FaucetResponse{Error: "Invalid wallet address"})
		return
	}

	// Get client IP - only trust proxy headers if configured
	ip := f.getClientIP(r, req.IP)

	// Check IP rate limit
	remaining, limited := f.checkIPRateLimit(ip)
	if limited {
		w.WriteHeader(http.StatusTooManyRequests)
		json.NewEncoder(w).Encode(FaucetResponse{
			Error:             "Too many requests from your IP. Please try again tomorrow.",
			RemainingRequests: 0,
		})
		return
	}

	// Check address cooldown
	cooldownRemaining := f.checkAddressCooldown(address)
	if cooldownRemaining > 0 {
		w.WriteHeader(http.StatusTooManyRequests)
		json.NewEncoder(w).Encode(FaucetResponse{
			Error:           fmt.Sprintf("This address is on cooldown. Please wait %d minutes.", cooldownRemaining/60),
			CooldownSeconds: cooldownRemaining,
		})
		return
	}

	// Send transaction
	txHash, err := f.sendFaucetTransaction(address)
	if err != nil {
		log.Printf("Faucet transaction failed for %s: %v", address, err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(FaucetResponse{Error: "Transaction failed. Please try again later."})
		return
	}

	// Record the request
	f.recordRequest(ip, address)

	// Convert wei to coin units for display (1 coin = 1e18 wei)
	amountInCoins := float64(f.config.Amount) / 1e18
	symbol := f.config.Symbol
	if symbol == "" {
		symbol = "coins" // fallback if not configured
	}
	log.Printf("Faucet: sent %.6f %s to %s, tx: %s", amountInCoins, symbol, address, txHash)

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(FaucetResponse{
		Success:           true,
		Message:           fmt.Sprintf("Successfully sent %.6f %s to %s", amountInCoins, symbol, address),
		TxHash:            txHash,
		Amount:            f.config.Amount,
		AmountFormatted:   fmt.Sprintf("%.6f", amountInCoins),
		Symbol:            symbol,
		RemainingRequests: remaining - 1,
	})
}

func (f *FaucetServer) sendFaucetTransaction(to string) (string, error) {
	// Get gas limit
	gas := util.String2Big(f.config.Gas)

	// Get gas price
	var gasPrice *big.Int
	if f.config.AutoGas {
		gasPrice = big.NewInt(0) // Will be auto-determined by node
	} else {
		gasPrice = util.String2Big(f.config.GasPrice)
	}

	// Amount to send
	amount := big.NewInt(f.config.Amount)

	// Send transaction using pool's address (configured in faucet config)
	txHash, err := f.rpc.SendTransaction(
		f.config.Address,
		to,
		hexutil.EncodeBig(gas),
		hexutil.EncodeBig(gasPrice),
		hexutil.EncodeBig(amount),
		f.config.AutoGas,
	)
	if err != nil {
		return "", err
	}

	return txHash, nil
}

func (f *FaucetServer) checkIPRateLimit(ip string) (remaining int, limited bool) {
	f.ipRequestsMu.Lock()
	defer f.ipRequestsMu.Unlock()

	now := time.Now().Unix()
	dayStart := now - (now % 86400) // Start of current day

	info, exists := f.ipRequests[ip]
	if !exists || info.resetTime < dayStart {
		// New day or new IP
		f.ipRequests[ip] = &ipRequestInfo{count: 0, resetTime: dayStart}
		return f.config.MaxDailyPerIP, false
	}

	remaining = f.config.MaxDailyPerIP - info.count
	if remaining <= 0 {
		return 0, true
	}
	return remaining, false
}

func (f *FaucetServer) checkAddressCooldown(address string) int64 {
	f.addrCooldownMu.RLock()
	lastRequest, exists := f.addrCooldowns[address]
	f.addrCooldownMu.RUnlock()

	if !exists {
		return 0
	}

	now := time.Now().Unix()
	cooldownEnd := lastRequest + f.config.CooldownMinutes*60
	if now >= cooldownEnd {
		// Cooldown expired
		f.addrCooldownMu.Lock()
		delete(f.addrCooldowns, address)
		f.addrCooldownMu.Unlock()
		return 0
	}

	return cooldownEnd - now
}

func (f *FaucetServer) recordRequest(ip string, address string) {
	now := time.Now().Unix()

	// Update IP count
	f.ipRequestsMu.Lock()
	if info, exists := f.ipRequests[ip]; exists {
		info.count++
	}
	f.ipRequestsMu.Unlock()

	// Update address cooldown
	f.addrCooldownMu.Lock()
	f.addrCooldowns[address] = now
	f.addrCooldownMu.Unlock()

	// Update statistics
	f.statsMu.Lock()
	f.totalRequests++
	f.totalSent.Add(f.totalSent, big.NewInt(f.config.Amount))
	f.uniqueAddresses[address] = true
	f.statsMu.Unlock()

	// Persist statistics to Redis
	f.saveStats(address)
}

// getClientIP extracts client IP with security considerations
// Only trusts proxy headers (X-Forwarded-For, X-Real-IP) if TrustProxy is enabled
// When TrustProxy is false, always uses direct connection IP
func (f *FaucetServer) getClientIP(r *http.Request, requestIP string) string {
	// If TrustProxy is enabled, trust the IP from the request body (from frontend proxy)
	if f.config.TrustProxy {
		if requestIP != "" {
			return requestIP
		}

		// Check X-Forwarded-For header
		forwarded := r.Header.Get("X-Forwarded-For")
		if forwarded != "" {
			parts := strings.Split(forwarded, ",")
			return strings.TrimSpace(parts[0])
		}

		// Check X-Real-IP header
		realIP := r.Header.Get("X-Real-IP")
		if realIP != "" {
			return realIP
		}
	}

	// Fall back to RemoteAddr (direct connection IP)
	addr := r.RemoteAddr
	if idx := strings.LastIndex(addr, ":"); idx != -1 {
		return addr[:idx]
	}
	return addr
}

// Redis key constants for faucet statistics
const (
	faucetTotalRequestsKey   = "faucet:stats:totalRequests"
	faucetTotalSentKey       = "faucet:stats:totalSent"
	faucetUniqueAddressesKey = "faucet:stats:uniqueAddresses"
)

// loadStats loads persistent statistics from Redis
func (f *FaucetServer) loadStats() {
	if f.backend == nil {
		return
	}
	client := f.backend.Client()

	// Load total requests
	totalRequests, err := client.Get(faucetTotalRequestsKey).Int64()
	if err == nil {
		f.totalRequests = totalRequests
	}

	// Load total sent as string to handle values that exceed int64
	totalSentStr, err := client.Get(faucetTotalSentKey).Result()
	if err == nil && totalSentStr != "" {
		sent := new(big.Int)
		if _, ok := sent.SetString(totalSentStr, 10); ok {
			// If the value is negative (int64 overflow in Redis), recalculate from totalRequests
			if sent.Sign() < 0 {
				// The value overflowed in Redis. Recalculate: totalRequests * amount
				corrected := new(big.Int).Mul(big.NewInt(f.totalRequests), big.NewInt(f.config.Amount))
				f.totalSent = corrected
				// Fix the value in Redis
				client.Set(faucetTotalSentKey, corrected.String(), 0)
				log.Printf("Faucet: corrected overflowed totalSent from %s to %s", totalSentStr, corrected.String())
			} else {
				f.totalSent = sent
			}
		}
	}

	// Load unique addresses
	addresses, err := client.SMembers(faucetUniqueAddressesKey).Result()
	if err == nil {
		f.statsMu.Lock()
		for _, addr := range addresses {
			f.uniqueAddresses[addr] = true
		}
		f.statsMu.Unlock()
	}

	log.Printf("Faucet: loaded stats - requests=%d, sent=%s, uniqueAddresses=%d",
		f.totalRequests, f.totalSent.String(), len(f.uniqueAddresses))
}

// saveStats saves statistics to Redis
func (f *FaucetServer) saveStats(address string) {
	if f.backend == nil {
		return
	}
	client := f.backend.Client()

	// Use pipeline for efficiency
	// Store totalSent as string to avoid int64 overflow in Redis
	f.statsMu.RLock()
	totalSentStr := f.totalSent.String()
	f.statsMu.RUnlock()

	pipe := client.Pipeline()
	pipe.Incr(faucetTotalRequestsKey)
	pipe.Set(faucetTotalSentKey, totalSentStr, 0)
	pipe.SAdd(faucetUniqueAddressesKey, address)
	_, err := pipe.Exec()
	if err != nil {
		log.Printf("Faucet: failed to save stats to Redis: %v", err)
	}
}
