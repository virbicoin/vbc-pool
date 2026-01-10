# Security Guide

This document provides comprehensive security guidelines for deploying and operating the VirBiCoin mining pool.

## Security Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Internet                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Reverse Proxy (nginx)                         │
│  • TLS Termination                                               │
│  • DDoS Protection                                               │
│  • Rate Limiting                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│   Frontend (Next.js)     │     │   Backend (Go)           │
│  • API Proxy             │     │  • Mining Proxy          │
│  • Rate Limiting         │     │  • Stratum Server        │
│  • Input Validation      │     │  • API Server            │
│  • Whitelist Validation  │     │  • Policy Enforcement    │
└─────────────────────────┘     └─────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Redis                                    │
│  • Password Protected                                            │
│  • Local Network Only                                            │
│  • Persistence Configured                                        │
└─────────────────────────────────────────────────────────────────┘
```

## Backend Security (Go)

### IP Banning with ipset

The pool supports firewall-level IP banning using Linux `ipset`:

```json
{
  "policy": {
    "banning": {
      "enabled": true,
      "ipset": "blacklist",
      "timeout": 1800,
      "invalidPercent": 30,
      "checkThreshold": 30,
      "malformedLimit": 5
    }
  }
}
```

**Setup ipset:**
```bash
# Create ipset
sudo ipset create blacklist hash:ip timeout 1800

# Configure iptables
sudo iptables -I INPUT -m set --match-set blacklist src -j DROP

# Allow pool process to add IPs (sudoers)
echo "pool ALL=NOPASSWD: /sbin/ipset" | sudo tee /etc/sudoers.d/pool
```

### Connection Rate Limiting

Prevents connection floods:

```json
{
  "policy": {
    "limits": {
      "enabled": true,
      "limit": 30,
      "grace": "5m",
      "limitJump": 10
    }
  }
}
```

- `limit`: Initial connections allowed per IP
- `grace`: Period after startup before enforcement
- `limitJump`: Connections added per valid share

### Stratum Security

```json
{
  "stratum": {
    "enabled": true,
    "listen": "0.0.0.0:8008",
    "timeout": "120s",
    "maxConn": 8192
  }
}
```

- `timeout`: Disconnects idle connections
- `maxConn`: Maximum concurrent connections

## Frontend Security (Next.js)

### API Proxy Architecture

All external API calls are proxied through `/api/[...slug]/route.ts`:

```typescript
// SECURITY: Whitelist of allowed pool IDs
const ALLOWED_POOL_IDS = new Set([
  "pool", "pool1", "pool2", "pool3", "pool4", "pool5", "global"
]);

// SECURITY: Whitelist of allowed API paths
const ALLOWED_API_PATHS = new Set([
  "stats", "blocks", "payments", "miners", "accounts", "health"
]);
```

### Path Traversal Prevention

```typescript
function isValidApiPath(apiPath: string): boolean {
  if (apiPath.includes("..") || apiPath.includes("//")) return false;
  if (!/^[a-zA-Z0-9\-_\/]+$/.test(apiPath)) return false;
  return ALLOWED_API_PATHS.has(apiPath.split("/")[0]);
}
```

### Suspicious Pattern Detection

The frontend blocks requests containing:

| Pattern | Attack Type |
|---------|-------------|
| `wget`, `curl` | Command injection |
| `;`, `\|`, `` ` `` | Shell injection |
| `$()`, `${}` | Variable expansion |
| `../`, `%2e%2e` | Path traversal |
| `<script>`, `javascript:` | XSS |
| `file:`, `gopher:`, `dict:` | Protocol smuggling |

### Rate Limiting

```typescript
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100;     // 100 requests/minute/IP
```

**Note**: In-memory rate limiting is not shared across serverless instances. For production, consider using Redis-based rate limiting (e.g., Upstash).

## Redis Security

### Configuration Best Practices

```json
{
  "redis": {
    "endpoint": "127.0.0.1:6379",
    "poolSize": 10,
    "database": 0,
    "password": "STRONG_PASSWORD_HERE"
  }
}
```

### Redis Server Configuration (`redis.conf`)

```conf
# Bind to localhost only
bind 127.0.0.1

# Require authentication
requirepass STRONG_PASSWORD_HERE

# Disable dangerous commands
rename-command FLUSHALL ""
rename-command FLUSHDB ""
rename-command DEBUG ""
rename-command CONFIG ""

# Enable persistence
save 900 1
save 300 10
save 60 10000
appendonly yes
```

## Configuration Security

### config.json

All frontend configuration is managed through `config.json`. This file contains:

- Coin settings (name, symbol, decimals)
- Pool settings (name, fee, payout threshold)
- API endpoints (base URLs)
- Server list (stratum servers)
- Branding (logo, favicon)
- External links (Discord, explorer)

**Security Note**: Ensure `config.json` does not contain sensitive information as it is exposed to the client.

### Private Configuration (Server-Only)

**NEVER** include in `config.json` or client-accessible files:

- Database passwords
- API keys
- Private keys
- Internal service URLs

## Production Deployment Checklist

### Before Deployment

- [ ] Change all default passwords in server `config.json`
- [ ] Set strong Redis password
- [ ] Configure `poolFeeAddress` for fee collection
- [ ] Review `donate` setting
- [ ] Set appropriate `depth` and `immatureDepth`

### Network Security

- [ ] Redis bound to localhost only
- [ ] Pool behind reverse proxy with TLS
- [ ] Firewall configured (allow only necessary ports)
- [ ] `behindReverseProxy: true` if using nginx/CloudFlare

### DDoS Protection

- [ ] Enable `banning` in policy config
- [ ] Configure `ipset` for firewall banning
- [ ] Enable `limits` for connection rate limiting
- [ ] Consider CloudFlare or similar service

### Monitoring

- [ ] Set up logging for all modules
- [ ] Monitor Redis memory usage
- [ ] Alert on unusual connection patterns
- [ ] Track invalid share ratios

## Incident Response

### If You Suspect a Breach

1. **Isolate**: Disconnect the affected system from the network
2. **Preserve**: Keep logs and Redis snapshots for analysis
3. **Investigate**: Check for unauthorized transactions
4. **Report**: Email security@virbicoin.com with details
5. **Recover**: Restore from known-good backup after patching

### Common Attack Indicators

- Sudden spike in invalid shares
- Unusual IP patterns in logs
- Unexpected Redis memory growth
- Failed payout transactions

## Vulnerability Disclosure

If you discover a security vulnerability:

1. **Do NOT** open a public GitHub issue
2. Email security@virbicoin.com with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Your contact information (for credit)

We aim to respond within 48 hours and will coordinate disclosure timing with you.

## Audit History

| Date | Scope | Result |
|------|-------|--------|
| January 2026 | Frontend npm dependencies | 0 vulnerabilities |
| January 2026 | API security review | Passed |
| January 2026 | Rate limiting implementation | Implemented |

---

*Last Updated: January 2026*
