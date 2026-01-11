# Mining Pool Frontend

Modern, responsive frontend application for cryptocurrency mining pools built with Next.js 16 and Tailwind CSS 4. Fully configurable for any Ethash-based coin.

## Features

- 📊 Real-time pool statistics and hashrate monitoring
- 👥 Miner dashboard with individual worker tracking
- 💰 Payment history and pending balance display
- 🔍 Block explorer with matured/immature/pending blocks
- 🧮 Mining calculator with 80+ GPU presets (RTX 5000/4000/3000, Radeon RX 7000/6000, Pro series, Intel Arc)
- 🚰 Faucet for distributing free test coins (with MetaMask integration)
- 🌍 Multi-region pool server support with latency display
- 🌐 Multi-language support (English, Japanese, Chinese)
- 📱 Fully responsive design
- 🎨 Dark theme with modern UI
- ⚙️ Single config.json for all settings (no environment variables needed)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **Icons**: Heroicons
- **Data Fetching**: SWR
- **Language**: TypeScript
- **i18n**: Custom client-side translation system

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
    "decimals": 18,
    "chainId": 1234,
    "rpcUrl": "https://rpc.example.com"
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
    },
    "fee": 1,
    "minPayout": 0.1,
    "payoutInterval": "2 hours"
  },
  "api": {
    "baseUrl": "https://api.example.com"
  },
  "servers": [
    {
      "id": "global",
      "location": "Global",
      "stratumUrl": "pool.example.com",
      "stratumPorts": [8002, 8004, 8009]
    }
  ]
}
```

**Note**: `pool.name`, `pool.description`, and `announcements[].title/message` support localization by providing an object with locale keys (`en`, `ja`, `zh`) instead of a plain string.

See `config.json.virbicoin` for a VirBiCoin-specific example.

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
│   ├── app/                    # Next.js App Router pages
│   │   ├── about/              # Terms of Service page
│   │   ├── account/[address]/  # Account details page
│   │   ├── api/                # API routes (proxy, faucet, health)
│   │   ├── blocks/             # Blocks pages (matured/immature/pending)
│   │   ├── calculator/         # Mining calculator with GPU presets
│   │   ├── faucet/             # Faucet page with MetaMask integration
│   │   ├── help/               # Getting started guide
│   │   ├── miners/             # Active miners list
│   │   └── payments/           # Payments history
│   ├── components/             # React components (39 components)
│   ├── lib/                    # Utilities (poolConfig, api, formatters)
│   └── i18n/                   # Internationalization setup
├── messages/                   # Translation files (en, ja, zh)
├── public/                     # Static assets
├── config.json                 # All pool configuration
├── config.json.example         # Template for new deployments
└── package.json
```

## Internationalization (i18n)

The application supports multiple languages:

| Language | Code | Status      |
| -------- | ---- | ----------- |
| English  | en   | ✅ Complete |
| Japanese | ja   | ✅ Complete |
| Chinese  | zh   | ✅ Complete |

Translation files are located in `messages/` directory. Users can switch languages via the language selector in the header.

## Components

The application includes 39 reusable React components:

### Core Components

- `Header` / `Footer` - Site navigation and branding
- `I18nProvider` / `LanguageSwitcher` - Multi-language support

### Dashboard Components

- `DashboardStats` - Pool statistics display
- `HomePageClient` - Main dashboard layout
- `MinerLeaderboard` - Top miners ranking
- `HashrateChart` - Hashrate history graph

### Account Components

- `AccountLookupForm` - Wallet address search
- `AccountTabs` - Account page navigation
- `WorkerStatusGrid` - Worker status display
- `FavoritesPanel` - Saved wallet addresses

### Block & Payment Components

- `BlocksTable` / `BlocksTabs` / `BlocksStats` - Block information
- `PaymentsTable` - Payment history
- `CSVExportButton` - Export to CSV

### Utility Components

- `TimeAgo` - Relative time display (auto-normalizes timestamps)
- `CopyButton` - Clipboard functionality
- `CodeBlock` - Code display with copy
- `CountryFlag` - Country flag icons
- `Countdown` - Timer display

### Feature Components

- `MetaMaskButton` - Wallet connection
- `WalletQRCode` - QR code generation
- `HashrateAlert` - Hashrate notifications
- `NotificationCenter` - Alert management
- `PoolHealthStatus` - Server health monitoring

## Security

This application implements multiple layers of security. For comprehensive documentation, see [../docs/SECURITY.md](../docs/SECURITY.md).

### Key Security Features

| Category           | Status    | Details                                 |
| ------------------ | --------- | --------------------------------------- |
| Command Injection  | ✅ Fixed  | `net.ParseIP()` validation              |
| CORS               | ✅ Fixed  | Origin whitelist implemented            |
| CSP                | ✅ Fixed  | Comprehensive headers in next.config.ts |
| Address Validation | ✅ Fixed  | Strict regex + sanitization             |
| Rate Limiting      | ✅ Active | 100 req/min/IP (in-memory)              |
| npm Dependencies   | ✅ Passed | 0 vulnerabilities (Jan 2026)            |

### Security Headers

```typescript
{
  "Content-Security-Policy": "default-src 'self'; ...",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
}
```

### API Security

- **Proxy Pattern**: All API requests proxied through `/api/[...slug]`
- **Whitelist Validation**: Pool IDs and paths validated
- **Path Traversal Prevention**: Sanitized paths
- **Request Timeout**: 10-second timeout

### Configuration Security

- `config.json` is client-exposed - **never include secrets**
- Sensitive data (Redis passwords, API keys) must be server-side only

## Production Checklist

- [x] Configure specific CORS origins
- [x] Add Content Security Policy headers
- [x] Enable address validation
- [x] Review config.json for secrets
- [ ] Enable HTTPS via reverse proxy
- [ ] Consider Redis-based rate limiting for scale

## License

MIT
