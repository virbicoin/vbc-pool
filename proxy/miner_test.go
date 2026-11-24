package proxy

import (
	"math/big"
	"testing"

	"github.com/ethereum/go-ethereum/common"
)

// Seal hash, nonce, mix digest and difficulty of two VirBiCoin mainnet blocks
// on either side of the first epoch boundary.
var mainnetBlocks = []Block{
	{
		number:      29999,
		hashNoNonce: common.HexToHash("0x95709730fc9c6d668503d4e0074f990dd23c11a5093e88f7a8d28a94b4d18274"),
		nonce:       0xc10ee2112cb2e34e,
		mixDigest:   common.HexToHash("0x5848e0e2af3d1bc1b9e1a0ed681bf95175db053aa713726b191d2434b385c61a"),
		difficulty:  big.NewInt(889437349609),
	},
	{
		number:      30000,
		hashNoNonce: common.HexToHash("0xf77e62370493112b1da7eac6a89d19f8ddff0b668ccc0c26f6aa6ee843b62744"),
		nonce:       0x103122822a653d1d,
		mixDigest:   common.HexToHash("0x53326dd50ffaf31aa125a4ffc04d6c4d8309bb1ebd85bb24041855828157c848"),
		difficulty:  big.NewInt(891174531932),
	},
}

func TestVerifyBlockMainnet(t *testing.T) {
	for _, block := range mainnetBlocks {
		if !verifyBlock(block) {
			t.Errorf("block %d: valid seal rejected", block.number)
		}

		wrongNonce := block
		wrongNonce.nonce++
		if verifyBlock(wrongNonce) {
			t.Errorf("block %d: accepted with a wrong nonce", block.number)
		}

		// The seal meets the block difficulty, so it must fail a target that is
		// far harder than any hash can plausibly reach.
		tooHard := block
		tooHard.difficulty = new(big.Int).Lsh(big.NewInt(1), 200)
		if verifyBlock(tooHard) {
			t.Errorf("block %d: accepted above its difficulty", block.number)
		}
	}
}

func TestEthashCacheReuse(t *testing.T) {
	first := cacheForBlock(1)
	if again := cacheForBlock(epochLength - 1); &again[0] != &first[0] {
		t.Error("cache rebuilt for a block of the same epoch")
	}
	if next := cacheForBlock(epochLength); &next[0] == &first[0] {
		t.Error("cache shared between different epochs")
	}

	// A third epoch evicts the oldest one; an older epoch is served uncached.
	cacheForBlock(2 * epochLength)
	ethashCaches.Lock()
	_, hasEpoch0 := ethashCaches.byEpoch[0]
	cached := len(ethashCaches.byEpoch)
	ethashCaches.Unlock()
	if hasEpoch0 || cached != maxCachedEpochs {
		t.Errorf("after three epochs: epoch 0 cached=%v, entries=%d, want false and %d", hasEpoch0, cached, maxCachedEpochs)
	}
	if !verifyBlock(mainnetBlocks[0]) {
		t.Error("block of an evicted epoch no longer verifies")
	}
}
