//go:build go1.9
// +build go1.9

package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"runtime"

	"github.com/yvasiyarov/gorelic"

	"github.com/virbicoin/open-virbicoin-pool/api"
	"github.com/virbicoin/open-virbicoin-pool/payouts"
	"github.com/virbicoin/open-virbicoin-pool/proxy"
	"github.com/virbicoin/open-virbicoin-pool/storage"
)

// Version information (set by build flags)
var (
	Version   = "dev"
	Commit    = "unknown"
	BuildTime = "unknown"
)

// printVersion displays version information
func printVersion() {
	fmt.Printf("Open Virbicoin Pool %s\n", Version)
	fmt.Printf("Commit: %s\n", Commit)
	fmt.Printf("Build Time: %s\n", BuildTime)
	fmt.Printf("Go Version: %s\n", runtime.Version())
	fmt.Printf("OS/Arch: %s/%s\n", runtime.GOOS, runtime.GOARCH)
}

var cfg proxy.Config
var backend *storage.RedisClient

func startProxy() {
	s := proxy.NewProxy(&cfg, backend)
	s.Start()
}

func startApi() {
	var s *api.ApiServer
	if cfg.Faucet.Enabled {
		s = api.NewApiServerWithFaucet(&cfg.Api, &cfg.Faucet, backend)
	} else {
		s = api.NewApiServer(&cfg.Api, backend)
	}
	s.Start()
}

func startBlockUnlocker() {
	u := payouts.NewBlockUnlocker(&cfg.BlockUnlocker, backend)
	u.Start()
}

func startPayoutsProcessor() {
	u := payouts.NewPayoutsProcessor(&cfg.Payouts, backend)
	u.Start()
}

func startNewrelic() {
	if len(cfg.NewrelicKey) > 0 {
		nr := gorelic.NewAgent()
		nr.Verbose = cfg.NewrelicVerbose
		nr.NewrelicLicense = cfg.NewrelicKey
		nr.NewrelicName = cfg.NewrelicName
		if err := nr.Run(); err != nil {
			log.Printf("Failed to start New Relic agent: %v", err)
		}
	}
}

func readConfig(cfg *proxy.Config) {
	configFileName := "config.json"
	if len(os.Args) > 1 {
		configFileName = os.Args[1]
	}
	if absPath, err := filepath.Abs(configFileName); err == nil {
		configFileName = absPath
	}
	log.Printf("Loading config: %v", configFileName)

	configFile, err := os.Open(configFileName)
	if err != nil {
		log.Fatal("File error: ", err.Error())
	}
	defer configFile.Close()
	jsonParser := json.NewDecoder(configFile)
	if err := jsonParser.Decode(&cfg); err != nil {
		log.Fatal("Config error: ", err.Error())
	}
}

func main() {
	// Parse command line flags
	var showVersion = flag.Bool("version", false, "Show version information")
	flag.Parse()
	
	if *showVersion {
		printVersion()
		os.Exit(0)
	}

	readConfig(&cfg)
	// Note: rand.Seed is deprecated in Go 1.20+. The default random generator is now automatically seeded.
	// If specific seeding is needed, use rand.New(rand.NewSource(time.Now().UnixNano()))

	if cfg.Threads > 0 {
		runtime.GOMAXPROCS(cfg.Threads)
		log.Printf("Running with %v threads", cfg.Threads)
	}

	startNewrelic()

	backend = storage.NewRedisClient(&cfg.Redis, cfg.Coin)
	pong, err := backend.Check()
	if err != nil {
		log.Printf("Can't establish connection to backend: %v", err)
	} else {
		log.Printf("Backend check reply: %v", pong)
	}

	if cfg.Proxy.Enabled {
		go startProxy()
	}
	if cfg.Api.Enabled {
		go startApi()
	}
	if cfg.BlockUnlocker.Enabled {
		go startBlockUnlocker()
	}
	if cfg.Payouts.Enabled {
		go startPayoutsProcessor()
	}
	quit := make(chan bool)
	<-quit
}
