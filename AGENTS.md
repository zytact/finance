# AGENTS.md

## Build/Lint/Test Commands
- **Development**: `pnpm dev` (Next.js with Turbopack)
- **Build**: `pnpm build` (Next.js with Turbopack)
- **Start**: `pnpm start` (Production server)
- **Lint**: `pnpm lint` (Biome check)
- **Format**: `pnpm format` (Biome format --write)
- **No test framework configured** - add test scripts to package.json if needed

## Code Style Guidelines
- **Language**: TypeScript with strict mode enabled
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS v4
- **Linting/Formatting**: Biome (2-space indentation, recommended rules)
- **Imports**: Organized automatically, path aliases `@/*` → `./src/*`
- **Naming**: PascalCase for components, camelCase for variables/functions
- **Types**: Explicit typing required, Readonly props for immutability
- **Error Handling**: Strict TypeScript enforces proper error boundaries
- **Domains**: Next.js and React recommended rules enabled

## Additional Notes
- No Cursor rules (.cursor/rules/) or Copilot rules (.github/copilot-instructions.md) found
- Use `biome check --write` for auto-fixing lint issues
- Run lint before commits to maintain code quality