module github.com/virbicoin/open-virbicoin-pool

go 1.24.0

toolchain go1.26.4

require (
	github.com/ethereum/go-ethereum v1.10.26
	github.com/gorilla/mux v1.8.1
	github.com/yvasiyarov/gorelic v0.0.7
	golang.org/x/crypto v0.25.0
	gopkg.in/redis.v3 v3.6.4
)

require (
	github.com/btcsuite/btcd/btcec/v2 v2.2.0 // indirect
	github.com/decred/dcrd/dcrec/secp256k1/v4 v4.0.1 // indirect
	github.com/garyburd/redigo v1.6.4 // indirect
	github.com/onsi/ginkgo v1.16.5 // indirect
	github.com/onsi/gomega v1.41.0 // indirect
	github.com/yvasiyarov/go-metrics v0.0.0-20150112132944-c25f46c4b940 // indirect
	github.com/yvasiyarov/newrelic_platform_go v0.0.0-20160601141957-9c099fbc30e9 // indirect
	golang.org/x/sys v0.22.0 // indirect
	gopkg.in/bsm/ratelimit.v1 v1.0.0-20170922094635-f56db5e73a5e // indirect
)

replace github.com/ethereum/go-ethereum => github.com/virbicoin/go-virbicoin v1.10.26
