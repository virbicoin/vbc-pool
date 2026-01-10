# Mining Pool Frontend

Modern, responsive frontend application for cryptocurrency mining pools built with Next.js 16 and Tailwind CSS. Fully configurable for any Ethash-based coin.

## Features

- 📊 Real-time pool statistics and hashrate monitoring
- 👥 Miner dashboard with individual worker tracking
- 💰 Payment history and pending balance display
- 🔍 Block explorer with matured/immature/pending blocks
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
│   │   ├── api/             # API routes
│   │   ├── blocks/          # Blocks pages (matured/immature/pending)
│   │   ├── calculator/      # Mining calculator
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

This application implements multiple layers of security:

### API Security

- **Proxy Pattern**: All API requests are proxied through Next.js API routes (`/api/[...slug]`) to hide backend infrastructure
- **Whitelist Validation**: Pool IDs and API paths are validated against explicit whitelists
- **Path Traversal Prevention**: API paths are sanitized to prevent directory traversal attacks (`..`, `//`, special characters)
- **Request Timeout**: All upstream requests have a 10-second timeout to prevent hanging connections

### Rate Limiting

- **In-memory Rate Limiting**: 100 requests per minute per IP address
- **429 Response**: Excessive requests receive "Too Many Requests" with `Retry-After` header

### Input Validation

- **Suspicious Pattern Detection**: Blocks requests containing:
  - Command injection patterns (`wget`, `curl`, `;`, `|`, backticks)
  - Path traversal attempts (`../`, `%2e%2e`)
  - XSS attempts (`<script>`, `javascript:`)
  - Protocol smuggling (`file:`, `gopher:`, `dict:`)
- **URL Decoding**: All URLs are decoded before validation to catch encoded attacks

### Configuration Security

- All configuration is managed through `config.json`
- Sensitive configuration (Redis passwords, private keys) must be kept in server-side config only
- `config.json` is exposed to the client, so never include secrets

### Headers

- CORS headers are set explicitly on API responses
- `Access-Control-Allow-Origin: *` for public API access

### Dependency Security

- **Last Audit**: January 2026 - 0 vulnerabilities found
- Run `npm audit` regularly to check for new vulnerabilities
- Keep dependencies updated with `npx npm-check-updates -u`

### Best Practices

- Never commit files containing secrets
- Review `config.json` before production deployment
- Use `config.json.example` as a template for new deployments

## License

MIT
