# CLAUDE.md - AI Assistant Guidelines

This file provides context and guidelines for AI assistants working on this project.

## Project Overview

VirBiCoin Pool Frontend - A Next.js 16 application for the VirBiCoin mining pool.

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
│   ├── lib/           # Utilities
│   └── types/         # TypeScript types
├── public/            # Static assets
├── pools.json         # Pool configuration
└── package.json
```

## Important Files

- `pools.json` - Pool server configuration (used by help page)
- `src/middleware.ts` - CORS and security headers
- `src/lib/api.ts` - API utilities
- `src/lib/formatters.ts` - Number/date formatting

## Common Tasks

### Adding a New Pool Server

1. Edit `pools.json`
2. Add environment variable `NEXT_PUBLIC_POOLn_URL`
3. The help page will automatically display the new server

### Adding a New Page

1. Create folder in `src/app/`
2. Add `page.tsx` file
3. Use consistent header pattern with icons

### Component Patterns

- Use Heroicons for icons
- Use consistent color scheme (green for success, blue for info, etc.)
- Use `bg-gray-800` for cards with `border-gray-700`

## Security Considerations

- **Audit**: Run `npm audit` regularly to check for vulnerabilities.
- **Secrets**: Never expose API keys, passwords, or private keys in client code or commit them to the repository.
- **Environment Variables**: Use `NEXT_PUBLIC_` prefix only for public environment variables.
- **API**: API requests are proxied through Next.js API routes to hide backend details.
- **CORS**: CORS is handled by middleware to prevent unauthorized access.

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
