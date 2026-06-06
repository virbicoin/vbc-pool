package proxy

import (
	"encoding/binary"
	"log"
	"math/big"
	"strconv"
	"strings"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"golang.org/x/crypto/sha3"
)

const (
	epochLength    = 30000
	hashBytes      = 64
	hashWords      = 16
	mixBytes       = 128
	mixHashes      = mixBytes / hashBytes
	loopAccesses   = 64
	cacheRounds    = 3
	datasetParents = 256
)

var maxUint256 = new(big.Int).Exp(big.NewInt(2), big.NewInt(256), big.NewInt(0))

func makeSeedHash(epoch uint64) (sh common.Hash) {
	for ; epoch > 0; epoch-- {
		sh = crypto.Keccak256Hash(sh[:])
	}
	return sh
}

func (s *ProxyServer) processShare(login, id, ip string, t *BlockTemplate, params []string) (bool, bool) {
	nonceHex := params[0]
	hashNoNonce := params[1]
	mixDigest := params[2]
	nonce, _ := strconv.ParseUint(strings.Replace(nonceHex, "0x", "", -1), 16, 64)
	shareDiff := s.config.Proxy.Difficulty

	h, ok := t.headers[hashNoNonce]
	if !ok {
		log.Printf("Stale share from %v@%v", login, ip)
		return false, false
	}

	share := Block{
		number:      h.height,
		hashNoNonce: common.HexToHash(hashNoNonce),
		difficulty:  big.NewInt(shareDiff),
		nonce:       nonce,
		mixDigest:   common.HexToHash(mixDigest),
	}

	block := Block{
		number:      h.height,
		hashNoNonce: common.HexToHash(hashNoNonce),
		difficulty:  h.diff,
		nonce:       nonce,
		mixDigest:   common.HexToHash(mixDigest),
	}

	if !verifyBlock(share) {
		return false, false
	}

	if verifyBlock(block) {
		ok, err := s.rpc().SubmitBlock(params)
		if err != nil {
			log.Printf("Block submission failure at height %v for %v: %v", h.height, t.Header, err)
		} else if !ok {
			log.Printf("Block rejected at height %v for %v", h.height, t.Header)
			return false, false
		} else {
			s.fetchBlockTemplate()
			exist, err := s.backend.WriteBlock(login, id, params, shareDiff, h.diff.Int64(), h.height, s.hashrateExpiration)
			if exist {
				return true, false
			}
			if err != nil {
				log.Println("Failed to insert block candidate into backend:", err)
			} else {
				log.Printf("Inserted block %v to backend", h.height)
			}
			log.Printf("Block found by miner %v@%v at height %d", login, ip, h.height)
		}
	} else {
		exist, err := s.backend.WriteShare(login, id, params, shareDiff, h.height, s.hashrateExpiration)
		if exist {
			return true, false
		}
		if err != nil {
			log.Println("Failed to insert share data into backend:", err)
		}
	}
	return false, true
}

// verifyBlock performs Pure Go ethash PoW verification (no CGO required)
func verifyBlock(block Block) bool {
	blockNum := block.NumberU64()
	cache := makeCache(blockNum)
	datasetSize := calcDatasetSize(blockNum)

	digest, result := hashimotoLight(datasetSize, cache, block.HashNoNonce().Bytes(), block.Nonce())

	// Check mix digest
	if common.BytesToHash(digest) != block.MixDigest() {
		return false
	}

	// Check difficulty target
	target := new(big.Int).Div(maxUint256, block.Difficulty())
	return new(big.Int).SetBytes(result).Cmp(target) <= 0
}

// --- Pure Go Ethash Implementation ---

func fnv(a, b uint32) uint32 {
	return a*0x01000193 ^ b
}

func fnvHash(mix []uint32, data []uint32) {
	for i := range mix {
		mix[i] = fnv(mix[i], data[i])
	}
}

func keccak512(data []byte) []byte {
	h := sha3.NewLegacyKeccak512()
	h.Write(data)
	return h.Sum(nil)
}

func keccak256(data []byte) []byte {
	h := sha3.NewLegacyKeccak256()
	h.Write(data)
	return h.Sum(nil)
}

// makeCache generates the ethash verification cache for a given block number
func makeCache(blockNum uint64) []uint32 {
	epoch := blockNum / epochLength
	size := calcCacheSize(epoch)
	seed := makeSeedHash(epoch)

	n := size / hashBytes
	cache := make([]byte, size)

	// Sequential generation
	src := keccak512(seed[:])
	copy(cache, src)
	for i := uint64(1); i < n; i++ {
		src = keccak512(cache[(i-1)*hashBytes : i*hashBytes])
		copy(cache[i*hashBytes:], src)
	}

	// RandMemoHash
	temp := make([]byte, hashBytes)
	for round := 0; round < cacheRounds; round++ {
		for i := uint64(0); i < n; i++ {
			srcOff := ((i - 1 + n) % n) * hashBytes
			dstOff := binary.LittleEndian.Uint32(cache[i*hashBytes:]) % uint32(n)
			xorOff := uint64(dstOff) * hashBytes

			for j := uint64(0); j < hashBytes; j++ {
				temp[j] = cache[srcOff+j] ^ cache[xorOff+j]
			}
			copy(cache[i*hashBytes:], keccak512(temp))
		}
	}

	// Convert to uint32 array
	result := make([]uint32, size/4)
	for i := range result {
		result[i] = binary.LittleEndian.Uint32(cache[i*4:])
	}
	return result
}

// calcDatasetItem calculates a single dataset item from the cache
func calcDatasetItem(cache []uint32, index uint32) []uint32 {
	rows := uint32(len(cache) / hashWords)
	mix := make([]uint32, hashWords)

	// Initialize with cache data
	copy(mix, cache[index%rows*hashWords:])
	mix[0] ^= index

	// Convert to bytes, hash, convert back
	buf := make([]byte, hashBytes)
	for i, val := range mix {
		binary.LittleEndian.PutUint32(buf[i*4:], val)
	}
	buf = keccak512(buf)
	for i := range mix {
		mix[i] = binary.LittleEndian.Uint32(buf[i*4:])
	}

	// fnv with cache entries
	for i := uint32(0); i < datasetParents; i++ {
		parent := fnv(index^i, mix[i%hashWords]) % rows
		fnvHash(mix, cache[parent*hashWords:parent*hashWords+hashWords])
	}

	// Final hash
	for i, val := range mix {
		binary.LittleEndian.PutUint32(buf[i*4:], val)
	}
	buf = keccak512(buf)
	for i := range mix {
		mix[i] = binary.LittleEndian.Uint32(buf[i*4:])
	}
	return mix
}

// hashimotoLight computes the ethash hash using only the cache (light verification)
func hashimotoLight(datasetSize uint64, cache []uint32, header []byte, nonce uint64) ([]byte, []byte) {
	rows := uint32(datasetSize / mixBytes)

	// Combine header and nonce
	seed := make([]byte, 40)
	copy(seed, header)
	binary.LittleEndian.PutUint64(seed[32:], nonce)
	seed = keccak512(seed)

	seedHead := binary.LittleEndian.Uint32(seed)

	// Initialize mix
	mix := make([]uint32, mixBytes/4)
	for i := 0; i < mixBytes/4; i++ {
		mix[i] = binary.LittleEndian.Uint32(seed[i%16*4:])
	}

	// Main DAG lookup loop
	for i := uint32(0); i < loopAccesses; i++ {
		p := fnv(i^seedHead, mix[i%uint32(mixBytes/4)]) % rows
		for j := 0; j < mixHashes; j++ {
			item := calcDatasetItem(cache, p*uint32(mixHashes)+uint32(j))
			fnvHash(mix[j*hashWords:(j+1)*hashWords], item)
		}
	}

	// Compress mix
	cmix := make([]uint32, mixBytes/4/4)
	for i := 0; i < len(cmix); i++ {
		cmix[i] = fnv(fnv(fnv(mix[i*4], mix[i*4+1]), mix[i*4+2]), mix[i*4+3])
	}

	// Convert compressed mix to bytes (this is the mix digest)
	digest := make([]byte, 32)
	for i, val := range cmix {
		binary.LittleEndian.PutUint32(digest[i*4:], val)
	}

	// Compute final hash: keccak256(seed + cmix)
	result := make([]byte, 64+32)
	copy(result, seed)
	copy(result[64:], digest)

	return digest, keccak256(result)
}

// --- Size calculation tables (simplified) ---

func calcCacheSize(epoch uint64) uint64 {
	// Cache size grows linearly with epoch
	size := uint64(1 << 24) // 16 MB initial
	size += uint64(1<<17) * epoch
	// Round down to prime
	size -= hashBytes
	for !isPrime(size / hashBytes) {
		size -= 2 * hashBytes
	}
	return size
}

func calcDatasetSize(blockNum uint64) uint64 {
	epoch := blockNum / epochLength
	size := uint64(1 << 30) // 1 GB initial
	size += uint64(1<<23) * epoch
	// Round down to prime
	size -= mixBytes
	for !isPrime(size / mixBytes) {
		size -= 2 * mixBytes
	}
	return size
}

func isPrime(n uint64) bool {
	if n < 2 {
		return false
	}
	if n == 2 || n == 3 {
		return true
	}
	if n%2 == 0 || n%3 == 0 {
		return false
	}
	for i := uint64(5); i*i <= n; i += 6 {
		if n%i == 0 || n%(i+2) == 0 {
			return false
		}
	}
	return true
}
