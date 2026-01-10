package api

import (
	"context"
	"crypto/ecdsa"
	"encoding/json"
	"fmt"
	"log"
	"math/big"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/virbicoin/open-virbicoin-pool/storage"
	"github.com/virbicoin/open-virbicoin-pool/util"
)

type FaucetConfig struct {
	Enabled         bool   `json:"enabled"`
	Amount          int64  `json:"amount"`          // Amount in Wei
	CooldownMinutes int64  `json:"cooldownMinutes"` // Cooldown per address in minutes
	MaxDailyPerIP   int    `json:"maxDailyPerIP"`   // Max requests per IP per day
	Address         string `json:"address"`         // Faucet wallet address
	PrivateKey      string `json:"privateKey"`      // Private key for signing transactions
	Daemon          string `json:"daemon"`          // RPC endpoint
	Timeout         string `json:"timeout"`
	Gas             string `json:"gas"`
	GasPrice        string `json:"gasPrice"`
	AutoGas         bool   `json:"autoGas"`
	ChainID         int64  `json:"chainId"` // Chain ID for EIP-155
}

type FaucetServer struct {
	config     *FaucetConfig
	backend    *storage.RedisClient
	ethClient  *ethclient.Client
	privateKey *ecdsa.PrivateKey
	chainID    *big.Int

	// Rate limiting
	ipRequests     map[string]*ipRequestInfo
	ipRequestsMu   sync.RWMutex
	addrCooldowns  map[string]int64
	addrCooldownMu sync.RWMutex
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
	RemainingRequests int    `json:"remainingRequests,omitempty"`
	CooldownSeconds   int64  `json:"cooldownSeconds,omitempty"`
}

func NewFaucetServer(cfg *FaucetConfig, backend *storage.RedisClient) *FaucetServer {
	f := &FaucetServer{
		config:        cfg,
		backend:       backend,
		ipRequests:    make(map[string]*ipRequestInfo),
		addrCooldowns: make(map[string]int64),
	}
	if cfg.Enabled {
		// Parse private key
		if cfg.PrivateKey != "" {
			privateKey, err := crypto.HexToECDSA(strings.TrimPrefix(cfg.PrivateKey, "0x"))
			if err != nil {
				log.Fatalf("Failed to parse faucet private key: %v", err)
			}
			f.privateKey = privateKey

			// Verify address matches private key
			publicKey := privateKey.Public()
			publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
			if !ok {
				log.Fatal("Failed to get public key from private key")
			}
			derivedAddress := crypto.PubkeyToAddress(*publicKeyECDSA)
			if !strings.EqualFold(derivedAddress.Hex(), cfg.Address) {
				log.Printf("Warning: Faucet address %s doesn't match derived address %s", cfg.Address, derivedAddress.Hex())
			}
		}

		// Set chain ID
		if cfg.ChainID > 0 {
			f.chainID = big.NewInt(cfg.ChainID)
		} else {
			f.chainID = big.NewInt(329) // Default VirBiCoin chain ID
		}

		// Connect to Ethereum client
		timeout := util.MustParseDuration(cfg.Timeout)
		ctx, cancel := context.WithTimeout(context.Background(), timeout)
		defer cancel()

		client, err := ethclient.DialContext(ctx, cfg.Daemon)
		if err != nil {
			log.Printf("Warning: Failed to connect to Ethereum client: %v", err)
		} else {
			f.ethClient = client
		}
	}
	return f
}

func (f *FaucetServer) GetStatus(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Cache-Control", "no-cache")
	w.WriteHeader(http.StatusOK)

	reply := map[string]interface{}{
		"enabled": f.config.Enabled,
	}
	if f.config.Enabled {
		reply["amount"] = f.config.Amount
		reply["cooldownMinutes"] = f.config.CooldownMinutes
	}

	json.NewEncoder(w).Encode(reply)
}

func (f *FaucetServer) HandleRequest(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.Header().Set("Access-Control-Allow-Origin", "*")
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

	// Get client IP
	ip := req.IP
	if ip == "" {
		ip = getClientIP(r)
	}

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

	log.Printf("Faucet: sent %d Shannon to %s, tx: %s", f.config.Amount, address, txHash)

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(FaucetResponse{
		Success:           true,
		Message:           fmt.Sprintf("Successfully sent %d Shannon to %s", f.config.Amount, address),
		TxHash:            txHash,
		Amount:            f.config.Amount,
		RemainingRequests: remaining - 1,
	})
}

func (f *FaucetServer) sendFaucetTransaction(to string) (string, error) {
	if f.privateKey == nil {
		return "", fmt.Errorf("private key not configured")
	}
	if f.ethClient == nil {
		return "", fmt.Errorf("ethereum client not connected")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	fromAddress := crypto.PubkeyToAddress(f.privateKey.PublicKey)
	toAddress := common.HexToAddress(to)

	// Get nonce
	nonce, err := f.ethClient.PendingNonceAt(ctx, fromAddress)
	if err != nil {
		return "", fmt.Errorf("failed to get nonce: %v", err)
	}

	// Get gas price
	var gasPrice *big.Int
	if f.config.AutoGas {
		gasPrice, err = f.ethClient.SuggestGasPrice(ctx)
		if err != nil {
			return "", fmt.Errorf("failed to suggest gas price: %v", err)
		}
	} else {
		gasPrice = util.String2Big(f.config.GasPrice)
	}

	// Gas limit
	gasLimit := uint64(21000)
	if f.config.Gas != "" {
		gasLimit = util.String2Big(f.config.Gas).Uint64()
	}

	// Amount
	amount := big.NewInt(f.config.Amount)

	// Create transaction
	tx := types.NewTransaction(nonce, toAddress, amount, gasLimit, gasPrice, nil)

	// Sign transaction
	signedTx, err := types.SignTx(tx, types.NewEIP155Signer(f.chainID), f.privateKey)
	if err != nil {
		return "", fmt.Errorf("failed to sign transaction: %v", err)
	}

	// Send transaction
	err = f.ethClient.SendTransaction(ctx, signedTx)
	if err != nil {
		return "", fmt.Errorf("failed to send transaction: %v", err)
	}

	return signedTx.Hash().Hex(), nil
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
}

func getClientIP(r *http.Request) string {
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

	// Fall back to RemoteAddr
	addr := r.RemoteAddr
	if idx := strings.LastIndex(addr, ":"); idx != -1 {
		return addr[:idx]
	}
	return addr
}
