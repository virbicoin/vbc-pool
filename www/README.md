# VirBiCoin Pool Frontend

Modern, responsive frontend application for the VirBiCoin mining pool built with Next.js 16 and Tailwind CSS.

## Features

- 📊 Real-time pool statistics and hashrate monitoring
- 👥 Miner dashboard with individual worker tracking
- 💰 Payment history and pending balance display
- 🔍 Block explorer with matured/immature/pending blocks
- 🌍 Multi-region pool server support
- 📱 Fully responsive design
- 🎨 Dark theme with modern UI

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

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# API Endpoints
NEXT_PUBLIC_API_BASE_URL=https://api.digitalregion.jp
NEXT_PUBLIC_POOL_BASE_URL=https://pool.digitalregion.jp

# Pool Health Check URLs (Dynamic - up to 10 pools)
NEXT_PUBLIC_POOL1_URL=https://pool1.digitalregion.jp
NEXT_PUBLIC_POOL2_URL=https://pool2.digitalregion.jp
NEXT_PUBLIC_POOL3_URL=https://pool3.digitalregion.jp
NEXT_PUBLIC_POOL4_URL=https://pool4.digitalregion.jp
NEXT_PUBLIC_POOL5_URL=https://pool5.digitalregion.jp
```

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
│   │   ├── help/            # Getting started guide
│   │   ├── miners/          # Miners list page
│   │   └── payments/        # Payments page
│   ├── components/          # React components
│   ├── lib/                 # Utility functions
│   └── types/               # TypeScript type definitions
├── public/                  # Static assets
├── pools.json               # Pool server configuration
└── package.json
```

## Configuration

### pools.json

Pool server configuration is stored in `pools.json`:

```json
[
  {
    "id": "global",
    "apiUrl": "https://pool.digitalregion.jp",
    "stratumUrl": "stratum.digitalregion.jp",
    "location": "Global",
    "country": "GLOBAL",
    "region": "Global",
    "stratumPorts": [8002, 8004, 8009],
    "active": true
  }
]
```

## Security

- All API requests are proxied through Next.js API routes
- Environment variables are validated at build time
- No sensitive data is exposed to the client
- CORS is handled by the middleware

## License

MIT
