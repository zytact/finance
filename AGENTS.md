# AGENTS.md

## Build/Lint/Test Commands

- **Development**: `pnpm dev` (Next.js with Turbopack)
- **Build**: `pnpm build` (Next.js with Turbopack)
- **Start**: `pnpm start` (Production server)
- **Lint**: `pnpm lint` (Biome check)
- **Format**: `pnpm format` (Biome format --write)
- **Type Check**: `npx tsc --noEmit` (TypeScript strict mode)
- **Test**: No test framework configured - add Jest/Vitest scripts to package.json if needed

## Code Style Guidelines

- **Language**: TypeScript with strict mode enabled (ES2017 target)
- **Framework**: Next.js 15 with React 19, App Router
- **Styling**: Tailwind CSS v4 with class-variance-authority for variants. Also uses shadcn/ui.
- **Linting/Formatting**: Biome (2-space indentation, recommended rules, auto-imports)
- **Imports**: Path aliases `@/*` → `./src/*`, organized automatically
- **Naming**: PascalCase for components/functions, camelCase for variables/props
- **Types**: Explicit typing required, Readonly props for immutability, interface over type
- **Components**: Functional components with destructured props, forwardRef for ref forwarding
- **Error Handling**: Strict TypeScript with proper error boundaries
- **Domains**: Next.js and React recommended rules enabled

## Additional Notes

- No Cursor rules (.cursor/rules/) or Copilot rules (.github/copilot-instructions.md) found
- Use `biome check --write` for auto-fixing lint issues
- Run lint and type check before commits to maintain code quality
- Use `cn()` utility from `@/lib/utils` for conditional Tailwind classes
