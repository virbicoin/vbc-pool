<p align="center">
  <img src="https://raw.githubusercontent.com/virbicoin/vbcstats/main/public/VBC.svg" alt="VirBiCoin Logo" width="120" height="120">
</p>

<h1 align="center">Open VirBiCoin Pool</h1>

<p align="center">
  <strong>Open Source Ethereum-Compatible Mining Pool for VirBiCoin</strong>
</p>

<p align="center">
  <a href="https://pool.virbicoin.com">
    <img src="https://img.shields.io/badge/Pool-pool.virbicoin.com-cyan?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Pool">
  </a>
  <a href="https://explorer.virbicoin.com">
    <img src="https://img.shields.io/badge/Explorer-Live-green?style=for-the-badge&logo=ethereum&logoColor=white" alt="Explorer">
  </a>
  <a href="https://discord.virbicoin.com">
    <img src="https://img.shields.io/badge/Discord-Join-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord">
  </a>
</p>

<p align="center">
  <a href="https://github.com/virbicoin/open-virbicoin-pool/actions/workflows/go.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/virbicoin/open-virbicoin-pool/go.yml?style=flat-square&label=CI" alt="CI">
  </a>
  <a href="https://goreportcard.com/report/github.com/virbicoin/open-virbicoin-pool">
    <img src="https://img.shields.io/badge/Go_Report-A+-brightgreen?style=flat-square&logo=go&logoColor=white" alt="Go Report">
  </a>
  <a href="https://pkg.go.dev/github.com/virbicoin/open-virbicoin-pool">
    <img src="https://img.shields.io/badge/Go_Reference-pkg.go.dev-007D9C?style=flat-square&logo=go&logoColor=white" alt="Go Reference">
  </a>
  <img src="https://img.shields.io/badge/Go-≥1.22-00ADD8?style=flat-square&logo=go&logoColor=white" alt="Go">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/License-GPL--3.0-blue?style=flat-square" alt="License: GPL-3.0">
</p>

---

![Miner's stats page](https://github.com/user-attachments/assets/4c88b87f-a9da-4dde-9efc-8e95a16f697b)

### Features

**This pool is being further developed to provide an easy to use pool for VirBiCOin miners. This software is functional however an optimised release of the pool is expected soon. Testing and bug submissions are welcome!**

* Support for HTTP and Stratum mining
* Detailed block stats with luck percentage and full reward
* Failover gvbc instances: gvbc high availability built in
* Modern beautiful Next.js frontend with multi-language support (English, Japanese, Chinese)
* Separate stats for workers: can highlight timed-out workers so miners can perform maintenance of rigs
* JSON-API for stats
* 🧮 Mining calculator with 80+ GPU presets (NVIDIA RTX 3000/4000/5000, AMD Radeon RX 6000/7000, Intel Arc, Pro series)
* 🚰 Faucet service for distributing free test coins (with MetaMask integration, Redis-persistent statistics)
#### Proxies

* [Ether-Proxy](https://github.com/sammy007/ether-proxy) HTTP proxy with web interface
* [Stratum Proxy](https://github.com/Atrides/eth-proxy) for Ethereum

### Building on Linux

Dependencies:

  * go >= 1.9 (version 1.22.12 works for me)
  * gvbc or parity-virbicoin
  * redis-server >= 2.8.0
  * nodejs >= 16 LTS
  * nginx

**I highly recommend to use Ubuntu 16.04 LTS or higher.**

First install  [go-virbicoin](https://github.com/virbicoin/go-virbicoin/wiki/Installing-Gvbc).

Clone & compile:

    git config --global http.https://gopkg.in.followRedirects true
    git clone https://github.com/virbicoin/open-virbicoin-pool.git
    cd open-virbicoin-pool
    go build

Install redis-server.

### Running Pool

    ./build/bin/open-virbicoin-pool config.json

You can use Ubuntu upstart - check for sample config in <code>upstart.conf</code>.

### Building Frontend

Install nodejs. I suggest using LTS version >= 4.x from https://github.com/nodesource/distributions or from your Linux distribution or simply install nodejs on Ubuntu Xenial 16.04.

The frontend is a Next.js application that polls the pool API to render miner stats.

    cd www

Copy <code>config.json.example</code> to <code>config.json</code> and configure for your coin:

```json
{
  "coin": {
    "name": "YourCoin",
    "symbol": "YCN"
  },
  "pool": {
    "name": {
      "en": "YourCoin Pool",
      "ja": "YourCoin プール",
      "zh": "YourCoin 矿池"
    },
    "description": {
      "en": "Official Mining Pool",
      "ja": "公式マイニングプール",
      "zh": "官方矿池"
    }
  },
  "api": {
    "baseUrl": "https://api.example.com"
  },
  "servers": [...]
}
```

**Note**: `pool.name`, `pool.description`, and `announcements[].title/message` support localization by providing an object with locale keys (`en`, `ja`, `zh`).

See <code>config.json.virbicoin</code> for a complete example.

    npm install
    npm run build
    npm run start

Configure nginx to serve API on <code>/api</code> subdirectory.
Configure nginx to reverse proxy on<code>http://localhost:3000</code> as website.

#### Serving API using nginx

Create an upstream for API:

    upstream api {
        server 127.0.0.1:8080;
    }

and add this setting after <code>location /</code>:

    location /api {
        proxy_pass http://api;
    }

#### Customization

You can customize the layout using built-in web server with live reload:

    npm run dev

**Don't use built-in web server in production**.

Check out <code>www/app</code> directory and edit these templates
in order to customise the frontend.

### Security

We take security seriously. See [docs/SECURITY.md](docs/SECURITY.md) for comprehensive security documentation.

#### Latest Security Audit (January 2026)

| Severity | Count | Fixed |
|----------|-------|-------|
| 🔴 Critical | 2 | 2 |
| 🟠 High | 6 | 4 |
| 🟡 Medium | 13 | 6 |
| 🟢 Low | 11 | 3 |
| ℹ️ Info | 10 | - |

**Key Findings & Status:**
*   ✅ **Command Injection Risk**: IP validation added to banning system - *Fixed*
*   ✅ **CORS Strictification**: Origin whitelist implemented - *Fixed*
*   ✅ **Security Headers**: CSP, X-Frame-Options, HSTS added - *Fixed*
*   ✅ **Faucet Security**: IP spoofing protection, request size limits - *Fixed*
*   ⚠️ **No TLS by Default**: Deploy behind reverse proxy with TLS - *Documented*
*   ✅ **Frontend npm audit**: 0 vulnerabilities found

#### Documentation
*   [docs/SECURITY.md](docs/SECURITY.md) - Comprehensive security guide
*   [docs/FAUCET.md](docs/FAUCET.md) - Faucet setup and configuration
*   [docs/CALCULATOR.md](docs/CALCULATOR.md) - Mining calculator with GPU database
*   [docs/PAYOUTS.md](docs/PAYOUTS.md) - Payout system documentation
*   [docs/STRATUM.md](docs/STRATUM.md) - Stratum protocol details
*   [docs/POLICIES.md](docs/POLICIES.md) - Policy configuration
*   [www/README.md](www/README.md) - Frontend documentation

#### Dependency Security
*   **Frontend (`www`)**: Audited January 10, 2026 - **0 vulnerabilities** found
*   **Backend (Go)**: Uses standard library and well-maintained packages
    * Consider upgrading `gopkg.in/redis.v3` to `github.com/go-redis/redis/v9`
*   Run `npm audit` (frontend) and review Go dependencies regularly

#### Reporting Vulnerabilities
If you find a security vulnerability, please **do not open a public issue**. Instead:
- Email: security@virbicoin.com
- Or contact the repository owner directly

#### Backend Security Features
*   **IP Banning**: Configurable via `ipset` integration for firewall-level blocking
*   **Rate Limiting**: Connection limits with grace period and progressive increase
*   **Invalid Share Detection**: Automatic banning after threshold of invalid shares
*   **Malformed Request Protection**: Limits on malformed requests before ban

#### Frontend Security Features
*   **API Proxy**: All requests proxied through Next.js to hide backend infrastructure
*   **Whitelist Validation**: Pool IDs and API paths validated against explicit lists
*   **Path Traversal Prevention**: Sanitization prevents `../` attacks
*   **Suspicious Pattern Blocking**: Detects command injection, XSS, protocol smuggling
*   **Rate Limiting**: 100 requests/minute/IP with automatic cleanup

#### Production Deployment Checklist
- [ ] Read [docs/SECURITY.md](docs/SECURITY.md) completely
- [ ] Change all default passwords in `config.json`
- [ ] Set strong Redis password (not empty)
- [ ] Never expose Redis to public network
- [ ] Configure `poolFeeAddress` before enabling payouts
- [ ] Run behind reverse proxy (nginx) with TLS
- [ ] Enable `banning` in production for DDoS protection
- [ ] Set `behindReverseProxy: true` if using nginx/CloudFlare
- [ ] Restrict CORS to specific origins in production
- [ ] Validate IP address format before banning operations

### Configuration

Configuration is actually simple, just read it twice and think twice before changing defaults.

**Don't copy config directly from this manual. Use the example config from the package,
otherwise you will get errors on start because of JSON comments.**

```javascript
{
  // Set to the number of CPU cores of your server
  "threads": 2,
  // Prefix for keys in redis store
  "coin": "vbc",
  // Give unique name to each instance
  "name": "main",

  "proxy": {
    "enabled": true,

    // Bind HTTP mining endpoint to this IP:PORT
    "listen": "0.0.0.0:8888",

    // Allow only this header and body size of HTTP request from miners
    "limitHeadersSize": 1024,
    "limitBodySize": 256,

    /* Set to true if you are behind CloudFlare (not recommended) or behind http-reverse
      proxy to enable IP detection from X-Forwarded-For header.
      Advanced users only. It's tricky to make it right and secure.
    */
    "behindReverseProxy": false,

    // Stratum mining endpoint
    "stratum": {
      "enabled": true,
      // Bind stratum mining socket to this IP:PORT
      "listen": "0.0.0.0:8008",
      "timeout": "120s",
      "maxConn": 8192
    },

    // Try to get new job from geth in this interval
    "blockRefreshInterval": "120ms",
    "stateUpdateInterval": "3s",
    // Require this share difficulty from miners
    "difficulty": 2000000000,

    /* Reply error to miner instead of job if redis is unavailable.
      Should save electricity to miners if pool is sick and they didn't set up failovers.
    */
    "healthCheck": true,
    // Mark pool sick after this number of redis failures.
    "maxFails": 100,
    // TTL for workers stats, usually should be equal to large hashrate window from API section
    "hashrateExpiration": "3h",

    "policy": {
      "workers": 8,
      "resetInterval": "60m",
      "refreshInterval": "1m",

      "banning": {
        "enabled": false,
        /* Name of ipset for banning.
        Check http://ipset.netfilter.org/ documentation.
        */
        "ipset": "blacklist",
        // Remove ban after this amount of time
        "timeout": 1800,
        // Percent of invalid shares from all shares to ban miner
        "invalidPercent": 30,
        // Check after after miner submitted this number of shares
        "checkThreshold": 30,
        // Bad miner after this number of malformed requests
        "malformedLimit": 5
      },
      // Connection rate limit
      "limits": {
        "enabled": false,
        // Number of initial connections
        "limit": 30,
        "grace": "5m",
        // Increase allowed number of connections on each valid share
        "limitJump": 10
      }
    }
  },

  // Provides JSON data for frontend which is static website
  "api": {
    "enabled": true,
    "listen": "0.0.0.0:8080",
    // Collect miners stats (hashrate, ...) in this interval
    "statsCollectInterval": "5s",
    // Purge stale stats interval
    "purgeInterval": "10m",
    // Fast hashrate estimation window for each miner from it's shares
    "hashrateWindow": "30m",
    // Long and precise hashrate from shares, 3h is cool, keep it
    "hashrateLargeWindow": "3h",
    // Collect stats for shares/diff ratio for this number of blocks
    "luckWindow": [64, 128, 256],
    // Max number of payments to display in frontend
    "payments": 50,
    // Max numbers of blocks to display in frontend
    "blocks": 50,

    /* If you are running API node on a different server where this module
      is reading data from redis writeable slave, you must run an api instance with this option enabled in order to purge hashrate stats from main redis node.
      Only redis writeable slave will work properly if you are distributing using redis slaves.
      Very advanced. Usually all modules should share same redis instance.
    */
    "purgeOnly": false
  },

  // Check health of each geth node in this interval
  "upstreamCheckInterval": "5s",

  /* List of geth nodes to poll for new jobs. Pool will try to get work from
    first alive one and check in background for failed to back up.
    Current block template of the pool is always cached in RAM indeed.
  */
  "upstream": [
    {
      "name": "main",
      "url": "http://127.0.0.1:8329",
      "timeout": "10s"
    },
    {
      "name": "backup",
      "url": "http://127.0.0.2:8329",
      "timeout": "10s"
    }
  ],

  // This is standard redis connection options
  "redis": {
    // Where your redis instance is listening for commands
    "endpoint": "127.0.0.1:6379",
    "poolSize": 10,
    "database": 0,
    "password": ""
  },

  // This module periodically remits ether to miners
  "unlocker": {
    "enabled": false,
    // Pool fee percentage
    "poolFee": 1.0,
    // Pool fees beneficiary address (leave it blank to disable fee withdrawals)
    "poolFeeAddress": "",
    // Donate 10% from pool fees to developers
    "donate": true,
    // Unlock only if this number of blocks mined back
    "depth": 120,
    // Simply don't touch this option
    "immatureDepth": 20,
    // Keep mined transaction fees as pool fees
    "keepTxFees": false,
    // Run unlocker in this interval
    "interval": "10m",
    // Geth instance node rpc endpoint for unlocking blocks
    "daemon": "http://127.0.0.1:8329",
    // Rise error if can't reach geth in this amount of time
    "timeout": "10s"
  },

  // Pay out miners using this module
  "payouts": {
    "enabled": false,
    // Require minimum number of peers on node
    "requirePeers": 25,
    // Run payouts in this interval
    "interval": "12h",
    // Geth instance node rpc endpoint for payouts processing
    "daemon": "http://127.0.0.1:8329",
    // Rise error if can't reach geth in this amount of time
    "timeout": "10s",
    // Address with pool balance
    "address": "0x0",
    // Let geth to determine gas and gasPrice
    "autoGas": true,
    // Gas amount and price for payout tx (advanced users only)
    "gas": "21000",
    "gasPrice": "50000000000",
    // Send payment only if miner's balance is >= 0.5 Ether
    "threshold": 500000000,
    // Perform BGSAVE on Redis after successful payouts session
    "bgsave": false
  }
}
```

If you are distributing your pool deployment to several servers or processes,
create several configs and disable unneeded modules on each server. (Advanced users)

I recommend this deployment strategy:

* Mining instance - 1x (it depends, you can run one node for EU, one for US, one for Asia)
* Unlocker and payouts instance - 1x each (strict!)
* API instance - 1x

### Notes

* Unlocking and payouts are sequential, 1st tx go, 2nd waiting for 1st to confirm and so on. You can disable that in code. Carefully read `docs/PAYOUTS.md`.
* Also, keep in mind that **unlocking and payouts will halt in case of backend or node RPC errors**. In that case check everything and restart.
* You must restart module if you see errors with the word *suspended*.
* Don't run payouts and unlocker modules as part of mining node. Create separate configs for both, launch independently and make sure you have a single instance of each module running.
* If `poolFeeAddress` is not specified all pool profit will remain on coinbase address. If it specified, make sure to periodically send some dust back required for payments.

### Alternative Ethereum Implementations

This pool is tested to work with [Ethcore's Parity](https://github.com/ethcore/parity). Mining and block unlocking works, but I am not sure about payouts and suggest to run *official* geth node for payments.

### Credits

Made by sammy007. Licensed under GPLv3.

#### Contributors

[Alex Leverington](https://github.com/subtly)

### Donations

ETH/ETC: 0xb85150eb365e7df0941f0cf08235f987ba91506a

![](https://cdn.pbrd.co/images/GP5tI1D.png)

Highly appreciated.
