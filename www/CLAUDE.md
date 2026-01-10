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
│   ├── app/           # Pages (App Router)
│   ├── components/    # React components
│   └── lib/           # Utilities (poolConfig.ts, api.ts, formatters.ts)
├── public/            # Static assets
├── config.json        # All pool configuration (coin, servers, API, branding)
├── config.json.example # Template for new deployments
└── package.json
```

## Important Files

- `config.json` - All pool configuration (coin, API, servers, branding, links)
- `src/lib/poolConfig.ts` - Configuration loader and typed exports
- `src/lib/api.ts` - API utilities and base URL export
- `src/lib/formatters.ts` - Number/date formatting

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
3. Use consistent header pattern with icons

### Component Patterns

- Use Heroicons for icons
- Use consistent color scheme (green for success, blue for info, etc.)
- Use `bg-gray-800` for cards with `border-gray-700`

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
2. Use `pools.json` for pool server configuration
3. Follow existing component patterns
4. Use TypeScript interfaces for props
5. Keep components in `src/components/`
6. Use Japanese for user-facing text where appropriate
