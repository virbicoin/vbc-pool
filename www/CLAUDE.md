# CLAUDE.md - AI Assistant Guidelines

This file provides context and guidelines for AI assistants working on this project.

## Project Overview

Mining Pool Frontend - A configurable Next.js 16 application for cryptocurrency mining pools. All coin-specific settings are managed through `config.json`.

## Key Technologies

- **Next.js 16** with App Router
- **TypeScript** for type safety
- **Tailwind CSS 4** for styling
- **SWR** for data fetching
- **Heroicons** for icons

## Code Style

- Use **Prettier** for formatting (`npm run format`)
- Use **ESLint** for linting (`npm run lint`)
- Run `npm run check` before committing

### Prettier Configuration

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

## Project Structure

```
www/
├── src/
│   ├── app/                    # Pages (App Router)
│   │   ├── about/              # Terms of Service page
│   │   ├── account/[address]/  # Account details page
│   │   ├── api/                # API routes (proxy, faucet, health)
│   │   ├── blocks/             # Blocks pages (matured/immature/pending)
│   │   ├── calculator/         # Mining calculator with GPU database
│   │   ├── faucet/             # Faucet page with MetaMask integration
│   │   ├── help/               # Getting started guide with FAQ
│   │   ├── miners/             # Active miners list
│   │   └── payments/           # Payments history
│   ├── components/             # React components (39 total)
│   ├── lib/                    # Utilities (poolConfig.ts, api.ts, formatters.ts)
│   └── i18n/                   # Internationalization setup
├── messages/                   # Translation files (en.json, ja.json, zh.json)
├── public/                     # Static assets
├── config.json                 # All pool configuration (coin, servers, API, branding)
├── config.json.example         # Template for new deployments
└── package.json
```

## Important Files

- `config.json` - All pool configuration (coin, API, servers, branding, links)
- `src/lib/poolConfig.ts` - Configuration loader and typed exports
- `src/lib/api.ts` - API utilities and base URL export
- `src/lib/formatters.ts` - Number/date formatting
- `src/components/I18nProvider.tsx` - Translation context provider
- `messages/*.json` - Translation strings (en, ja, zh)

## Common Tasks

### Adding a New Pool Server

1. Edit `config.json`
2. Add new server object to the `servers` array
3. The help page will automatically display the new server

### Changing Coin Configuration

1. Edit `config.json`
2. Update `coin` section (name, symbol, chainId, rpcUrl)
3. Update `block` section (reward, time)
4. All components automatically use the new values

### Adding a New Page

1. Create folder in `src/app/`
2. Add `page.tsx` file
3. Add `"use client"` directive if using hooks
4. Import `useTranslation` for i18n support
5. Use consistent header pattern with icons

### Faucet Page

The faucet page (`/faucet`) includes:

- MetaMask wallet connection
- Real-time cooldown countdown
- Statistics display (balance, total sent, unique users)
- Copy to clipboard and share on Twitter
- "Add network to MetaMask" button

### Calculator Page

The calculator page (`/calculator`) includes:

- 80+ GPU presets (NVIDIA, AMD, Intel)
- Category-based GPU selection
- Power efficiency display (MH/W)
- Profitability calculation with electricity costs
- Real-time network statistics

### Help Page

The help page (`/help`) includes:

- Step-by-step mining setup guide
- Pool server locations with latency
- Mining software recommendations (lolMiner)
- NiceHash configuration
- FAQ section with 6 common questions

### Component Patterns

- Use Heroicons for icons
- Use consistent color scheme (green for success, blue for info, etc.)
- Use `bg-gray-800` for cards with `border-gray-700`
- Always add `"use client"` directive when using hooks

## Component List (39 components)

### Core

- `Header` / `Footer` - Navigation and branding
- `I18nProvider` / `LanguageSwitcher` - Multi-language support

### Dashboard

- `DashboardStats` - Pool statistics
- `HomePageClient` - Main dashboard
- `MinerLeaderboard` - Top miners
- `HashrateChart` - Hashrate graph
- `HeaderStats` - Stats in header
- `PoolStatsWidget` - Pool info widget

### Account

- `AccountLookupForm` - Wallet search
- `AccountTabs` - Account navigation
- `WorkerStatusGrid` - Worker status
- `FavoritesPanel` - Saved addresses
- `EarningsProjection` - Earnings calculator

### Blocks & Payments

- `BlocksTable` / `BlocksTabs` / `BlocksStats` - Block info
- `PaymentsTable` - Payment history
- `CSVExportButton` - Export functionality
- `BlockNotification` - New block alerts

### Utilities

- `TimeAgo` - Relative time (auto-normalizes timestamps)
- `CopyButton` - Clipboard
- `CodeBlock` - Code display
- `CountryFlag` - Country icons
- `Countdown` - Timer
- `ThemeToggle` - Theme switcher

### Features

- `MetaMaskButton` - Wallet connection
- `WalletQRCode` - QR generation
- `HashrateAlert` - Hashrate alerts
- `NotificationCenter` - Alert management
- `PoolHealthStatus` / `GlobalHealthChecker` - Health monitoring
- `NetworkStatus` - Network info
- `AutoRefreshSettings` - Refresh config
- `KeyboardShortcuts` - Keyboard navigation
- `ShareEstimator` - Share calculation
- `SocialShare` - Social sharing
- `Announcements` - Announcement display

## Security Considerations

### API Security Architecture

- **Proxy Pattern**: All external API calls go through `/api/[...slug]/route.ts`
- **Whitelist Validation**: Pool IDs and API paths are restricted to valid endpoints
- **Path Sanitization**: Prevents directory traversal (`..`, `//`, special chars)
- **10s Timeout**: Upstream requests timeout to prevent resource exhaustion

### Rate Limiting

- In-memory rate limiting: 100 requests/minute/IP
- Probabilistic cleanup to avoid memory leaks
- Note: Not shared across serverless instances; use Redis for production scale

### Input Validation

- `SUSPICIOUS_PATTERNS` array blocks command injection, XSS, protocol smuggling
- URL decoding before validation catches encoded attacks
- Malformed URL decoding returns 403

### Configuration Security

- **config.json**: All configuration is client-exposed, never include secrets
- **Sensitive Data**: Redis passwords, API keys must be in server-side config only
- **Validation**: Pool endpoints are validated against configured servers

### Dependency Management

- **Audit**: Run `npm audit` before each release
- **Update**: Use `npx npm-check-updates -u` to check for updates
- **Last Audit**: January 2026 - 0 vulnerabilities

### Security Checklist for PRs

- [ ] No secrets in code or commits
- [ ] Input validation for user data
- [ ] API paths validated against whitelist
- [ ] Rate limiting considered for new endpoints
- [ ] Dependencies audited after additions

## Testing

```bash
npm run check  # ESLint + TypeScript + Prettier
npm run build  # Build test
```

## Deployment

The application is deployed as a static site or with Node.js server.

```bash
npm run build
npm start
```

## Notes for AI Assistants

1. Always run `npm run check` after making changes
2. Use `config.json` for all pool configuration (coin, servers, API, branding, links)
3. Follow existing component patterns
4. Use TypeScript interfaces for props
5. Keep components in `src/components/`
6. Maintain security practices (input validation, CORS, CSP)
7. Footer link order: GitHub | Pool Address | X Bitcointalk Discord Telegram | Explorer Network

## Timestamp Handling

The `TimeAgo` component automatically normalizes timestamps:

- If `timestamp > 1e12`: treated as milliseconds (no conversion)
- Otherwise: treated as seconds and multiplied by 1000

**Important**: Do NOT pre-convert timestamps before passing to `TimeAgo`. The component handles normalization internally.

```tsx
// ✅ Correct - pass raw timestamp
<TimeAgo timestamp={worker.lastBeat} />;

// ❌ Wrong - do not pre-convert
const ms = timestamp * 1000;
<TimeAgo timestamp={ms} />;
```

## Internationalization (i18n)

The application supports multiple languages using a client-side translation system.

### Supported Languages

| Language | Code | File               | Status      |
| -------- | ---- | ------------------ | ----------- |
| English  | en   | `messages/en.json` | ✅ Complete |
| Japanese | ja   | `messages/ja.json` | ✅ Complete |
| Chinese  | zh   | `messages/zh.json` | ✅ Complete |

### config.json Localization

Some values in `config.json` support localization directly:

```json
{
  "pool": {
    "name": {
      "en": "VirBiCoin Pool",
      "ja": "VirBiCoin プール",
      "zh": "VirBiCoin 矿池"
    },
    "description": {
      "en": "Official Mining Pool",
      "ja": "公式マイニングプール",
      "zh": "官方矿池"
    }
  },
  "announcements": [
    {
      "id": "welcome",
      "title": {
        "en": "Welcome!",
        "ja": "ようこそ！",
        "zh": "欢迎！"
      },
      "message": {
        "en": "Thank you for mining.",
        "ja": "マイニングにご参加ください。",
        "zh": "感谢您挖矿。"
      }
    }
  ]
}
```

Use `getLocalizedValue()` from `poolConfig.ts` to retrieve localized values:

```tsx
import poolConfig, { getLocalizedValue } from "@/lib/poolConfig";
import { useTranslation } from "@/components/I18nProvider";

function MyComponent() {
  const { locale } = useTranslation();
  const poolName = getLocalizedValue(poolConfig.pool.name, locale);
  return <h1>{poolName}</h1>;
}
```

### Using Translations in Components

```tsx
"use client";

import { useTranslation } from "@/components/I18nProvider";

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("nav.home")}</h1>
      <p>{t("account.payoutInfo", { interval: "2 hours", minPayout: "0.1 VBC" })}</p>
    </div>
  );
}
```

### Translation Key Sections

- `common.*` - Common UI elements (loading, error, buttons)
- `nav.*` - Navigation items
- `stats.*` - Statistics labels
- `blocks.*` - Block-related text
- `miners.*` - Miners page
- `payments.*` - Payments page
- `account.*` - Account page (extensive)
- `worker.*` - Worker status
- `calculator.*` - Calculator page (48 keys)
- `help.*` - Help page (95+ keys with FAQ)
- `faucet.*` - Faucet page (40+ keys)
- `about.*` - Terms of Service (30+ keys)
- `time.*` - Time-related strings
- `footer.*` - Footer text

### Adding a New Language

1. Create `messages/[locale].json` with all translation keys
2. Edit `src/i18n/request.ts`:
   - Add locale to `locales` array
   - Add display name to `localeNames`
   - Add flag emoji to `localeFlags`

### Translation Checklist for New Features

- [ ] Add keys to all 3 language files (en, ja, zh)
- [ ] Use `t("section.key")` in component
- [ ] Add `"use client"` directive if not present
- [ ] Import `useTranslation` hook
- [ ] Test all languages via language switcher
