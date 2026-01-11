# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

#### Bug Fixes - January 11, 2026

1. **TimeAgo Component Timestamp Normalization**
   - Fixed timestamp display showing year 57999 instead of correct date
   - Added automatic detection of seconds vs milliseconds timestamps
   - Timestamps > 1e12 are treated as milliseconds, otherwise converted from seconds
   - Affected components: `TimeAgo.tsx`, `WorkerStatusGrid.tsx`

2. **WorkerStatusGrid Double Conversion Fix**
   - Removed redundant timestamp conversion that caused double multiplication
   - Now delegates timestamp normalization to `TimeAgo` component

### Changed

#### Frontend - January 11, 2026

- **Footer**: Pool address now links to block explorer
  - Uses `config.json` settings: `pool.address` + `links.explorer`
  - Falls back to plain text if explorer URL not configured
  - Added hover effect and underline for link styling

### Security

#### Security Fixes Implemented - January 10, 2026

Based on the comprehensive security audit, the following fixes have been implemented:

**🔴 Critical Fixes:**

1. **Command Injection Prevention** (Backend)
   - Added `IsValidIPAddress()` function in `util/util.go` using Go's `net.ParseIP()`
   - Updated `doBan()` in `policy/policy.go` to validate IP format before execution
   - Changed shell string execution to direct argument passing in `exec.Command()`

2. **Sensitive Configuration** (Documented)
   - Added documentation for using environment variables
   - Updated deployment checklist

**🟠 High Fixes:**

1. **CORS Strictification** (Frontend)
   - Replaced `Access-Control-Allow-Origin: *` with explicit origin whitelist
   - Added `getAllowedOrigin()` function for origin validation
   - Development mode allows localhost origins only

2. **Error Message Sanitization** (Frontend)
   - Internal error details now hidden in production
   - Only generic error messages returned to clients
   - Full details still logged server-side

3. **Hostname Non-Disclosure** (Frontend)
   - Removed `os.hostname()` from health endpoint response

**🟡 Medium Fixes:**

1. **Content Security Policy** (Frontend)
   - Added comprehensive CSP headers in `next.config.ts`
   - `X-Frame-Options: DENY` - Prevents clickjacking
   - `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy` - Disables unused browser features
   - `Strict-Transport-Security` - HSTS in production

2. **Address Validation Enhancement** (Frontend)
   - Added `isValidEthereumAddress()` - Strict regex validation
   - Added `sanitizeAddress()` - XSS prevention
   - Invalid addresses now show dedicated error page
   - URL parameters validated before API calls

**Files Modified:**
- `util/util.go` - Added `IsValidIPAddress()` function
- `policy/policy.go` - Secured `doBan()` function
- `www/next.config.ts` - Added security headers
- `www/src/app/api/[...slug]/route.ts` - CORS and error handling
- `www/src/app/api/stats/route.ts` - Error sanitization
- `www/src/app/health/route.ts` - Removed hostname
- `www/src/lib/formatters.ts` - Address validation functions
- `www/src/app/account/[address]/page.tsx` - Address validation UI
- `www/src/components/AccountLookupForm.tsx` - Input validation

#### Security Audit - January 10, 2026

A comprehensive security audit was conducted covering both backend (Go) and frontend (Next.js) components.

**Summary**: 42 findings identified (2 Critical, 6 High, 13 Medium, 11 Low, 10 Info)

**Critical Findings**:
1. ✅ Command injection risk in IP banning system - **FIXED**
2. ⚠️ Plaintext storage of sensitive configuration - recommend environment variables

**High Findings**:
1. ⚠️ X-Forwarded-For header spoofing vulnerability - Documented mitigation
2. ⚠️ No authentication on API endpoints - By design for public pool
3. ⚠️ No TLS/HTTPS encryption by default - Use reverse proxy
4. ⚠️ Empty Redis password by default - Documented in checklist
5. ✅ Overly permissive CORS settings (frontend) - **FIXED**
6. ⚠️ RPC endpoint exposure to client (frontend) - Use proxy RPC

**Documentation Updates**:
- [docs/SECURITY.md](docs/SECURITY.md) - Added full audit report with 30+ findings
- [README.md](README.md) - Updated security section with audit summary
- [www/README.md](www/README.md) - Added security audit summary and recommendations
- [docs/POLICIES.md](docs/POLICIES.md) - Added security warning for IP banning
- [docs/PAYOUTS.md](docs/PAYOUTS.md) - Added security notes for payout operations

**Dependency Audit**:
- Frontend (npm): 0 vulnerabilities found
- Backend (Go): Recommend upgrading `gopkg.in/redis.v3` to `github.com/go-redis/redis/v9`

### Changed

#### Frontend - January 10, 2026

- **Footer**: Added Explorer and Network Stats links with icons
- **Footer**: Removed Bitcoin icon orange color, using default gray
- **Footer**: Reorganized link order: GitHub | Pool Address | X Bitcointalk Discord Telegram | Explorer Network
- **Header Navigation**: Reorganized navigation order
  - Desktop/Mobile: Blocks → Miners → Payments → Calculator → Help → About
  - Removed "Home" link (logo links to home)
  - Changed "Pool Blocks" to "Blocks" with badge count
  - Miners shows badge with active miner count

### Added

#### Frontend Components - January 2026

- **MinerLeaderboard**: Top miners ranking display with gold/silver/bronze badges
- **SocialShare**: Social media sharing (X, Telegram, Reddit) with copy link
- **AutoRefreshSettings**: Configurable auto-refresh intervals (5-60 seconds)
- **ThemeToggle**: Dark/light/system theme toggle
- **NotificationCenter**: In-app notification management with read/unread states
- **EarningsProjection**: Mining earnings calculator (hourly/daily/weekly/monthly/yearly)
- **NetworkStatus**: Network connection status display
- **HashrateAlert**: Hashrate threshold alerts with customizable settings
- **WorkerStatusGrid**: Worker status visualization grid

#### Configuration

- Single `config.json` for all frontend settings
- Coin-agnostic configuration support
- Multi-region pool server support

## [1.0.0] - 2026-01-01

### Added

- Initial release of open-virbicoin-pool
- Modern Next.js 16 frontend with App Router
- Tailwind CSS 4 styling
- Real-time pool statistics with SWR
- Miner dashboard with worker tracking
- Block explorer (matured/immature/pending)
- Payment history display
- Mining calculator
- API proxy with security features
- Redis-based rate limiting
- IP banning with ipset integration
- Stratum mining support
- JSON-RPC API

### Security

- API whitelist validation
- Path traversal prevention
- Suspicious pattern blocking
- Connection rate limiting

---

*For security vulnerabilities, please email security@virbicoin.com - do not open public issues.*
