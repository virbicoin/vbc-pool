# Mining Pool Frontend

Modern, responsive frontend application for cryptocurrency mining pools built with Next.js 16 and Tailwind CSS. Fully configurable for any Ethash-based coin.

## Features

- 📊 Real-time pool statistics and hashrate monitoring
- 👥 Miner dashboard with individual worker tracking
- 💰 Payment history and pending balance display
- 🔍 Block explorer with matured/immature/pending blocks
- 🧮 Mining calculator with 80+ GPU presets (RTX 5000/4000/3000, Radeon RX 7000/6000, Pro series, Intel Arc)
- 🚰 Faucet for distributing free test coins (with MetaMask integration)
- 🌍 Multi-region pool server support
- 📱 Fully responsive design
- 🎨 Dark theme with modern UI
- ⚙️ Single config.json for all settings (no environment variables needed)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **Icons**: Heroicons
- **Data Fetching**: SWR
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 22+ (see `.nvmrc`)
- npm or yarn

### Installation

```bash
npm install
```

### Configuration

All configuration is managed through a single `config.json` file. Copy `config.json.example` to `config.json` and customize:

```json
{
  "coin": {
    "name": "YourCoin",
    "symbol": "YCN",
    "decimals": 18
  },
  "pool": {
    "name": "YourCoin Pool",
    "fee": "1%",
    "payoutThreshold": "0.5 YCN"
  },
  "api": {
    "baseUrl": "https://api.example.com"
  },
  "servers": [
    {
      "name": "pool1.example.com",
      "port": 8008,
      "region": "JP"
    }
  ]
}
```

See `config.json.virbicoin` for a VirBiCoin-specific example, or use `config.json.example` as a generic template.

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
npm start
```

### Code Quality

```bash
# Run all checks (ESLint + TypeScript + Prettier)
npm run check

# Lint only
npm run lint

# Format code
npm run format

# Check formatting
npm run format:check
```

## Project Structure

```
www/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── about/           # About page
│   │   ├── account/         # Account details page
│   │   ├── api/             # API routes (proxy, faucet, health)
│   │   ├── blocks/          # Blocks pages (matured/immature/pending)
│   │   ├── calculator/      # Mining calculator with GPU presets
│   │   ├── faucet/          # Faucet page with MetaMask integration
│   │   ├── help/            # Getting started guide
│   │   ├── miners/          # Miners list page
│   │   └── payments/        # Payments page
│   ├── components/          # React components
│   └── lib/                 # Utility functions and config
├── public/                  # Static assets
├── config.json              # All pool configuration
├── config.json.example      # Template for new deployments
└── package.json
```

## Security

This application implements multiple layers of security. For comprehensive security documentation, see [../docs/SECURITY.md](../docs/SECURITY.md).

### Security Fixes Implemented (January 10, 2026)

| Category           | Issue                   | Status    | Details                             |
| ------------------ | ----------------------- | --------- | ----------------------------------- |
| Command Injection  | IP validation in doBan  | ✅ Fixed  | `net.ParseIP()` validation added    |
| CORS               | Overly permissive (`*`) | ✅ Fixed  | Origin whitelist implemented        |
| CSP                | Not configured          | ✅ Fixed  | Comprehensive headers added         |
| Address Validation | Basic validation        | ✅ Fixed  | Strict regex + sanitization         |
| Error Exposure     | Details leaked          | ✅ Fixed  | Hidden in production                |
| Hostname           | Exposed in /health      | ✅ Fixed  | Removed from response               |
| Rate Limiting      | In-memory only          | ⚠️ Note   | Consider Redis-based for production |
| npm Dependencies   | 0 vulnerabilities       | ✅ Passed | Audited January 10, 2026            |

### Implemented Security Headers

The following headers are now applied to all responses via `next.config.ts`:

```typescript
{
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; ...",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains" // Production only
}
```

### CORS Configuration

CORS is now restricted to specific origins. Configure for your deployment in `src/app/api/[...slug]/route.ts`:

```typescript
const ALLOWED_ORIGINS = new Set([
  "https://pool.yourdomain.com",
  // Add your domains here
]);
```

### API Security

- **Proxy Pattern**: All API requests are proxied through Next.js API routes (`/api/[...slug]`) to hide backend infrastructure
- **Whitelist Validation**: Pool IDs and API paths are validated against explicit whitelists
- **Path Traversal Prevention**: API paths are sanitized to prevent directory traversal attacks (`..`, `//`, special characters)
- **Request Timeout**: All upstream requests have a 10-second timeout to prevent hanging connections

### Rate Limiting

- **In-memory Rate Limiting**: 100 requests per minute per IP address
- **429 Response**: Excessive requests receive "Too Many Requests" with `Retry-After` header
- **Production Note**: In-memory rate limiting is not shared across serverless instances. For production, consider using Redis-based rate limiting (e.g., Upstash).

### Input Validation

- **Address Validation**: Strict regex `/^0x[a-fA-F0-9]{40}$/` with sanitization
- **Suspicious Pattern Detection**: Blocks requests containing:
  - Command injection patterns (`wget`, `curl`, `;`, `|`, backticks)
  - Path traversal attempts (`../`, `%2e%2e`)
  - XSS attempts (`<script>`, `javascript:`)
  - Protocol smuggling (`file:`, `gopher:`, `dict:`)
- **URL Decoding**: All URLs are decoded before validation to catch encoded attacks

### Error Handling

- **Production**: Returns generic error messages to clients
- **Development**: Full error details for debugging
- **Logging**: All errors logged server-side regardless of environment

### Configuration Security

- All configuration is managed through `config.json`
- `config.json` is exposed to the client - **NEVER include secrets**
- Sensitive configuration (Redis passwords, private keys) must be kept in server-side config only
- Use `config.json.example` as a template for new deployments

### localStorage Usage

The following data is stored in localStorage:

- Favorite wallet addresses
- Notification settings
- Alert thresholds
- Theme preferences
- Auto-refresh settings

**Note**: localStorage is accessible via XSS. Ensure CSP is properly configured and avoid storing sensitive data.

### Dependency Security

- **Last Audit**: January 10, 2026 - 0 vulnerabilities found
- Run `npm audit` regularly to check for new vulnerabilities
- Keep dependencies updated with `npx npm-check-updates -u`

### Production Checklist

- [x] Configure specific CORS origins (not `*`)
- [x] Add Content Security Policy headers
- [ ] Implement Redis-based rate limiting (optional for scale)
- [x] Review `config.json` - ensure no secrets
- [ ] Enable HTTPS via reverse proxy
- [x] Set `Strict-Transport-Security` header

## License

MIT
