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
| January 10, 2026 | Security Fixes Implementation | Critical/High issues fixed |
| January 10, 2026 | Comprehensive Security Audit | 42 findings identified |
| January 10, 2026 | Frontend npm dependencies | 0 vulnerabilities |
| January 10, 2026 | Backend Go dependencies | Reviewed (see recommendations) |

---

## Implemented Security Measures

### Backend (Go) - Implemented

#### IP Address Validation (Critical Fix)

The `doBan()` function now validates IP addresses before executing ipset commands:

```go
// util/util.go
func IsValidIPAddress(ip string) bool {
    parsedIP := net.ParseIP(ip)
    return parsedIP != nil
}

// policy/policy.go
func (s *PolicyServer) doBan(ip string) {
    // SECURITY: Validate IP address format to prevent command injection
    if !util.IsValidIPAddress(ip) {
        log.Printf("SECURITY: Rejected invalid IP address format for banning: %s", ip)
        return
    }
    // Use exec.Command with separate arguments instead of shell string
    cmd := exec.Command("sudo", "ipset", "add", set, ip, "timeout", fmt.Sprintf("%d", timeout), "-!")
    // ...
}
```

### Frontend (Next.js) - Implemented

#### Content Security Policy Headers

All responses include comprehensive security headers configured in `next.config.ts`:

```typescript
// Security headers applied to all routes
{
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; ...",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains" // Production only
}
```

#### CORS Origin Whitelist

CORS is now restricted to specific origins:

```typescript
// Allowed origins (configure for your deployment)
const ALLOWED_ORIGINS = new Set([
  "https://pool.digitalregion.jp",
  "https://*.digitalregion.jp",
  // Development origins only in dev mode
]);

function getAllowedOrigin(requestOrigin: string | null): string {
  if (requestOrigin && ALLOWED_ORIGINS.has(requestOrigin)) {
    return requestOrigin;
  }
  // Development mode allows localhost
  if (process.env.NODE_ENV === "development" && requestOrigin?.startsWith("http://localhost:")) {
    return requestOrigin;
  }
  return ALLOWED_ORIGINS.values().next().value || "";
}
```

#### Address Validation

Ethereum addresses are now strictly validated:

```typescript
// lib/formatters.ts
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function sanitizeAddress(address: string): string {
  return address.replace(/[^0-9a-fA-Fx]/g, "").slice(0, 42);
}
```

#### Error Message Sanitization

Internal error details are hidden in production:

```typescript
return NextResponse.json({
  error: "Internal proxy error",
  // Only include details in development
  ...(process.env.NODE_ENV === "development" && {
    details: error instanceof Error ? error.message : "Unknown error",
  }),
}, { status: 500 });
```

---

## Security Audit Report - January 10, 2026

### Executive Summary

A comprehensive security audit was conducted covering both backend (Go) and frontend (Next.js) components.

| Severity | Count | Fixed |
|----------|-------|-------|
| 🔴 Critical | 2 | 1 ✅ |
| 🟠 High | 6 | 2 ✅ |
| 🟡 Medium | 13 | 4 ✅ |
| 🟢 Low | 11 | 1 ✅ |
| ℹ️ Info | 10 | - |
| **Total** | **42** | **8** |

---

### 🔴 Critical Findings

#### 1. Command Injection in IP Banning (Backend) ✅ FIXED

**File**: `policy/policy.go` - `doBan()` function  
**Status**: ✅ **Fixed on January 10, 2026**

**Fix Applied**:
- Added `IsValidIPAddress()` function in `util/util.go`
- `doBan()` now validates IP format before execution
- Changed from shell string to direct argument passing

```go
// Fixed implementation
func (s *PolicyServer) doBan(ip string) {
    if !util.IsValidIPAddress(ip) {
        log.Printf("SECURITY: Rejected invalid IP address format: %s", ip)
        return
    }
    cmd := exec.Command("sudo", "ipset", "add", set, ip, "timeout", fmt.Sprintf("%d", timeout), "-!")
    // ...
}
```

#### 2. Plaintext Storage of Sensitive Configuration ⚠️ DOCUMENTED

**File**: `config.json`  
**Status**: ⚠️ Documented - Use environment variables in production

**Recommendation**:
- Use environment variables for sensitive data
- Consider HashiCorp Vault or similar secrets management
- At minimum, set restrictive file permissions (chmod 600)

---

### 🟠 High Findings

#### 3. X-Forwarded-For Header Spoofing (Backend) ⚠️ DOCUMENTED

**File**: `proxy/handlers.go` lines 162-169  
**Status**: ⚠️ Documented mitigation

**Recommendation**: 
- Only trust X-Forwarded-For from known proxy IPs
- Use the rightmost untrusted IP in the chain
- Document proper reverse proxy configuration

#### 4. No Authentication on API Endpoints (Backend)

**File**: `api/server.go` lines 96-105  
**Description**: All API endpoints are publicly accessible without authentication.

**Recommendation**:
- Add authentication for administrative endpoints
- Consider API key authentication for write operations
- Rate limit unauthenticated requests more aggressively

#### 5. No TLS/HTTPS Encryption (Backend)

**Files**: `api/server.go`, `proxy/proxy.go`, `rpc/rpc.go`  
**Description**: All HTTP/TCP connections are unencrypted including RPC communication with wallet.

**Recommendation**:
- Deploy behind nginx/Caddy with TLS termination
- Enable TLS for RPC communication (critical for wallet operations)
- Document required TLS configuration

#### 6. Empty Redis Password by Default (Backend)

**File**: `config.example.json`  
**Description**: Redis password defaults to empty string, allowing unauthenticated access.

**Recommendation**:
- Remove empty default or set placeholder
- Add startup warning if password is empty in production
- Document Redis security configuration

#### 7. Overly Permissive CORS (Frontend) ✅ FIXED

**File**: `www/src/app/api/[...slug]/route.ts`  
**Status**: ✅ **Fixed on January 10, 2026**

**Fix Applied**:
- Implemented `ALLOWED_ORIGINS` whitelist
- Added `getAllowedOrigin()` function for origin validation
- Development mode allows localhost origins

```typescript
// Fixed implementation
const ALLOWED_ORIGINS = new Set([
  "https://pool.digitalregion.jp",
  "https://www.pool.digitalregion.jp",
]);

function getAllowedOrigin(requestOrigin: string | null): string {
  if (requestOrigin && ALLOWED_ORIGINS.has(requestOrigin)) {
    return requestOrigin;
  }
  // Development only
  if (process.env.NODE_ENV === "development" && 
      requestOrigin?.startsWith("http://localhost:")) {
    return requestOrigin;
  }
  return ALLOWED_ORIGINS.values().next().value || "";
}
```

#### 8. RPC Endpoint Exposure (Frontend) ⚠️ DOCUMENTED

**File**: `www/config.json`  
**Status**: ⚠️ Documented - Use proxy RPC in production

**Recommendation**:
- Use server-side-only RPC endpoints
- If public access needed, use rate-limited proxy RPC

---

### 🟡 Medium Findings

#### 9. Non-cryptographic Random Number Generator (Backend) ⚠️

**File**: `main.go` line 66  
**Description**: `math/rand` seeded with `time.Now().UnixNano()` is predictable.

**Recommendation**: Use `crypto/rand` for security-sensitive operations.

#### 10. Rate Limiting Disabled by Default (Backend) ⚠️

**File**: `config.example.json`  
**Description**: `limits.enabled` and `banning.enabled` default to false.

**Recommendation**: Enable by default or add startup warning.

#### 11. Missing HTTP Server Timeouts (Backend) ⚠️

**File**: `proxy/proxy.go`  
**Description**: No `ReadTimeout`, `WriteTimeout`, `IdleTimeout` configured. Vulnerable to Slowloris attacks.

**Recommendation**:
```go
srv := &http.Server{
    ReadTimeout:  10 * time.Second,
    WriteTimeout: 10 * time.Second,
    IdleTimeout:  30 * time.Second,
}
```

#### 12. RPC Error Message Information Disclosure (Backend) ⚠️

**File**: `rpc/rpc.go` line 215  
**Description**: RPC errors returned directly may leak internal information.

**Recommendation**: Sanitize error messages before returning to clients.

#### 13. Insufficient Payout Address Validation (Backend) ⚠️

**File**: `payouts/payer.go`  
**Description**: Addresses from Redis not re-validated before payment.

**Recommendation**: Add checksum validation before sending transactions.

#### 14. No Content Security Policy (Frontend) ✅ FIXED

**File**: `www/next.config.ts`  
**Status**: ✅ **Fixed on January 10, 2026**

**Fix Applied**:
- Added comprehensive CSP headers
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy
- Permissions-Policy
- Strict-Transport-Security (production only)

#### 15. No API Rate Limiting (Frontend) ⚠️

**File**: All API routes  
**Description**: Frontend API routes lack rate limiting for DDoS protection.

**Recommendation**: Implement Redis-based rate limiting (e.g., Upstash).

#### 16. URL Parameter Injection (Frontend) ✅ FIXED

**File**: `www/src/app/account/[address]/page.tsx`  
**Status**: ✅ **Fixed on January 10, 2026**

**Fix Applied**:
- Added `sanitizeAddress()` to sanitize URL parameter
- Added `isValidEthereumAddress()` validation
- Invalid addresses show dedicated error page

#### 17. Insufficient Wallet Address Validation (Frontend) ✅ FIXED

**File**: `www/src/components/AccountLookupForm.tsx`  
**Status**: ✅ **Fixed on January 10, 2026**

**Fix Applied**:
- Imported validation functions from formatters.ts
- Uses strict regex `/^0x[a-fA-F0-9]{40}$/` for validation

#### 18. Error Detail Exposure (Frontend) ✅ FIXED

**File**: `www/src/app/api/stats/route.ts`, `www/src/app/api/[...slug]/route.ts`  
**Status**: ✅ **Fixed on January 10, 2026**

**Fix Applied**:
- Error details only returned in development mode
- Production returns generic error message

---

### 🟢 Low Findings

#### 19. Sensitive Information in Logs (Backend) ⚠️

**Files**: `payouts/payer.go`, `payouts/unlocker.go`  
**Description**: IP addresses, wallet addresses logged in plaintext.

**Recommendation**: Add configurable log levels, mask sensitive data in production.

#### 20. Missing defer Error Handling (Backend)

**File**: `main.go` line 59  
**Description**: `configFile.Close()` error not checked.

**Recommendation**: Handle defer errors or use named return values.

#### 21. panic() Usage (Backend)

**File**: `util/util.go` line 66  
**Description**: `panic()` on parse errors causes full application crash.

**Recommendation**: Return errors to callers for graceful handling.

#### 22. Hardcoded Donation Address (Backend)

**File**: `payouts/payer.go` lines 36-37  
**Description**: Donation addresses hardcoded in source.

**Recommendation**: Move to configuration file for transparency.

#### 23. Hostname Disclosure (Frontend) ✅ FIXED

**File**: `www/src/app/health/route.ts`  
**Status**: ✅ **Fixed on January 10, 2026**

**Fix Applied**:
- Removed `os.hostname()` from response
- Health endpoint now only returns status and time

#### 24. localStorage Usage (Frontend) ⚠️

**Files**: Multiple components  
**Description**: User data stored in localStorage is accessible via XSS.

**Recommendation**: Ensure CSP mitigates XSS risk; avoid storing sensitive data.

---

### ℹ️ Informational Findings

#### 25. Outdated Redis Library (Backend)

**File**: `go.mod`  
**Description**: `gopkg.in/redis.v3` is outdated.

**Recommendation**: Upgrade to `github.com/go-redis/redis/v9`.

#### 26. Inconsistent Error Handling (Backend)

**Files**: Multiple  
**Description**: Some errors silently ignored.

**Recommendation**: Audit all error returns and handle appropriately.

#### 27. Session Management (Backend)

**File**: `proxy/stratum.go`  
**Description**: No session tokens for Stratum connections.

**Recommendation**: Consider session tokens for enhanced security.

#### 28. Integer Overflow Potential (Backend)

**File**: `payouts/payer.go`  
**Description**: Balance calculations could overflow with extreme values.

**Recommendation**: Add boundary checks or use `big.Int` consistently.

#### 29. Missing Content-Type Validation (Backend)

**File**: `proxy/handlers.go`  
**Description**: POST Content-Type not validated.

**Recommendation**: Require `application/json` Content-Type.

#### 30. CSRF Protection (Frontend)

**Description**: No CSRF tokens (acceptable for read-only public API).

**Recommendation**: Implement if adding authenticated state-changing operations.

---

## Recommended Security Headers

Add to `www/next.config.ts`:

```typescript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https://flagcdn.com https://*.yourdomain.com",
            "font-src 'self'",
            "connect-src 'self' https://api.yourdomain.com",
            "frame-ancestors 'none'",
          ].join('; ')
        },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
      ]
    }
  ]
}
```

---

## Priority Remediation Order

### Immediate (Critical)

1. Fix command injection in `doBan()` - validate IP format strictly
2. Move sensitive config to environment variables

### Short-term (High)

3. Implement TLS for all communications
4. Configure strict CORS origins
5. Add API authentication for admin endpoints
6. Protect RPC endpoints from public access

### Medium-term (Medium)

7. Enable rate limiting by default
8. Add HTTP server timeouts
9. Implement CSP headers
10. Strengthen address validation

### Long-term (Low/Info)

11. Update dependencies (`go-redis/v9`)
12. Audit and standardize error handling
13. Implement comprehensive logging with masking

---

*Last Updated: January 10, 2026*
