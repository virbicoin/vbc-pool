# Faucet Service

The faucet provides free coins to users for testing purposes. This document covers setup, configuration, and operation.

## Overview

The faucet service allows users to request a small amount of coins once per cooldown period. It includes multiple layers of rate limiting to prevent abuse.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User Browser  │────▶│  Frontend API   │────▶│   Backend API   │
│                 │     │  (Next.js)      │     │   (Go)          │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │  Geth Node      │
                                                │  (localhost)    │
                                                └─────────────────┘
```

## Setup

### 1. Create Faucet Wallet

```bash
# Create a new account in geth
geth account new --datadir /path/to/data

# Fund the faucet wallet with coins
```

### 2. Configure Geth

The faucet requires an unlocked geth account. For security, geth should only listen on localhost:

```bash
geth --http \
     --http.addr '127.0.0.1' \
     --http.port 8329 \
     --http.api 'eth,net,web3,personal' \
     --allow-insecure-unlock \
     --unlock '0xYourFaucetAddress' \
     --password /path/to/password.txt
```

**Security Note**: The geth RPC must only be accessible from localhost. Never expose an unlocked account to the network.

### 3. Backend Configuration (faucet.json)

Create a dedicated configuration file for the faucet service:

```json
{
  "threads": 2,
  "coin": "VBC",
  "name": "faucet",

  "redis": {
    "endpoint": "127.0.0.1:6379",
    "poolSize": 10,
    "database": 0,
    "password": ""
  },

  "api": {
    "enabled": true,
    "listen": "0.0.0.0:3002",
    "statsCollectInterval": "5s",
    "purgeInterval": "10m",
    "purgeOnly": false,
    "hashrateWindow": "30m",
    "hashrateLargeWindow": "3h",
    "payments": 30,
    "blocks": 50
  },

  "faucet": {
    "enabled": true,
    "amount": 10000000000000000,
    "cooldownMinutes": 1440,
    "maxDailyPerIP": 10,
    "address": "0xYourFaucetAddress",
    "daemon": "http://127.0.0.1:8329",
    "timeout": "10s",
    "gas": "0x5208",
    "gasPrice": "0x3B9ACA00",
    "autoGas": true,
    "allowedOrigins": ["https://pool.example.com"],
    "trustProxy": true
  }
}
```

### Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| `enabled` | bool | Enable/disable the faucet |
| `amount` | int64 | Amount in wei per request (10^18 = 1 coin) |
| `cooldownMinutes` | int64 | Minutes before same address can request again |
| `maxDailyPerIP` | int | Maximum requests per IP per day |
| `address` | string | Faucet wallet address (must be unlocked in geth) |
| `daemon` | string | Geth RPC endpoint (use localhost!) |
| `timeout` | string | RPC timeout |
| `gas` | string | Gas limit in hex (0x5208 = 21000 for simple transfer) |
| `gasPrice` | string | Gas price in hex (0x3B9ACA00 = 1 Gwei) |
| `autoGas` | bool | Let node determine gas price automatically |
| `allowedOrigins` | []string | CORS allowed origins (empty = allow all) |
| `trustProxy` | bool | Trust X-Forwarded-For header |

### 4. Frontend Configuration (config.json)

Add faucet settings to the frontend config:

```json
{
  "faucet": {
    "enabled": true,
    "amount": 0.01,
    "cooldownHours": 24,
    "maxDailyRequests": 10,
    "backendUrl": "https://api.example.com"
  }
}
```

### 5. Systemd Service

Create `/etc/systemd/system/faucet.service`:

```ini
[Unit]
Description=Faucet Service
After=network.target redis.service geth.service

[Service]
Type=simple
User=pool
Group=pool
ExecStart=/usr/local/bin/open-virbicoin-pool /etc/pool/faucet.json
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable faucet
sudo systemctl start faucet
```

### 6. Nginx Proxy

Add faucet API location to nginx:

```nginx
location /api/faucet {
    proxy_pass http://127.0.0.1:3002/api/faucet;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## API Endpoints

### GET /api/faucet

Returns faucet status, configuration, and statistics.

**Response:**

```json
{
  "enabled": true,
  "amount": 10000000000000000,
  "amountFormatted": "0.0100",
  "symbol": "VBC",
  "cooldownMinutes": 1440,
  "maxDailyPerIP": 10,
  "balance": "1000000000000000000",
  "balanceFormatted": "1.0000",
  "stats": {
    "totalRequests": 42,
    "totalSent": 420000000000000000,
    "totalSentFormatted": "0.4200",
    "uniqueAddresses": 35
  }
}
```

### POST /api/faucet

Request coins from the faucet.

**Request:**

```json
{
  "address": "0x1234567890abcdef1234567890abcdef12345678",
  "ip": "203.0.113.1"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Successfully sent 0.010000 coins to 0x...",
  "txHash": "0xabc123...",
  "amount": 10000000000000000,
  "amountFormatted": "0.010000",
  "remainingRequests": 9
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Invalid wallet address | Address format is incorrect |
| 429 | Too many requests | IP rate limit exceeded |
| 429 | Address on cooldown | Must wait before requesting again |
| 503 | Faucet is disabled | Faucet not enabled in config |
| 500 | Transaction failed | RPC error or insufficient funds |

## Security Considerations

### 1. Never Expose Geth Externally

The faucet wallet is unlocked in geth. If geth RPC is accessible from the network, anyone can drain the wallet.

```bash
# CORRECT: localhost only
--http.addr '127.0.0.1'

# WRONG: exposed to network
--http.addr '0.0.0.0'
```

### 2. Run Faucet on Same Server as Geth

The faucet service must run on the same server as geth to access the localhost RPC.

### 3. Trust Proxy Only Behind Reverse Proxy

Only set `trustProxy: true` when the faucet is behind a trusted reverse proxy (nginx, ALB, etc.).

```json
{
  "faucet": {
    "trustProxy": true
  }
}
```

If exposed directly to the internet, set `trustProxy: false` to prevent IP spoofing.

### 4. Configure CORS Properly

Restrict allowed origins in production:

```json
{
  "faucet": {
    "allowedOrigins": ["https://pool.example.com"]
  }
}
```

### 5. Monitor Faucet Balance

Set up alerts when the faucet balance drops below a threshold.

## Troubleshooting

### "private key not configured"

This error occurs when using old code that expected a private key. The current version uses `eth_sendTransaction` which requires an unlocked geth account.

**Solution:**
1. Ensure geth is running with `--allow-insecure-unlock --unlock 'address'`
2. Rebuild and redeploy the faucet binary

### "connection refused" to daemon

**Causes:**
- Geth is not running
- Geth is listening on different port
- Faucet service is on different server than geth

**Solution:**
1. Verify geth is running: `systemctl status geth`
2. Check geth is listening: `ss -tlnp | grep 8329`
3. Run faucet on the same server as geth

### "invalid character '<' looking for beginning"

Geth is returning HTML instead of JSON. Usually caused by wrong port or endpoint.

**Solution:**
Check the `daemon` URL in faucet config points to geth RPC port.

### Rate limit not working

If users can bypass rate limits:

1. Check `trustProxy` setting matches your deployment
2. Ensure nginx is setting `X-Real-IP` or `X-Forwarded-For`
3. Verify frontend and backend rate limiting are both active

## Monitoring

### Logs

Monitor faucet logs for:

```bash
journalctl -u faucet -f
```

Look for:
- Transaction success/failure
- Rate limit hits (429 responses)
- Cleanup messages (memory management)

### Metrics to Track

1. **Requests per hour**: Detect unusual patterns
2. **Unique addresses per day**: Track adoption
3. **Faucet balance**: Ensure sufficient funds
4. **Error rate**: Monitor RPC failures

### Example Log Output

```
2026/01/11 02:18:49 Faucet: sent 0.010000 coins to 0x47c93fd5..., tx: 0x3f0b3c7b...
2026/01/11 03:00:00 Faucet cleanup: IP entries=42, Address entries=156
```

## Calculating Faucet Amount

Consider these factors when setting the faucet amount:

| Factor | Consideration |
|--------|---------------|
| Block reward | Should be small fraction of block reward |
| Block time | Faster chains may need smaller amounts |
| Transaction fees | Should cover several transactions |
| Abuse potential | Lower = less attractive to farm |

### Example Calculation

For a chain with:
- Block reward: 8 coins
- Block time: 13 seconds
- Target: 0.1% of hourly mining reward

```
Blocks per hour = 3600 / 13 ≈ 277
Mining reward per hour = 277 × 8 = 2216 coins
Faucet per request = 2216 × 0.001 / 10 requests ≈ 0.22 coins
```

A conservative setting of 0.01 coins per request is typical.
