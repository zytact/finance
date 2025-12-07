# Agent Guidelines for Finance Calculator

## Build/Lint/Test Commands
- `pnpm dev` - Start dev server with Turbopack
- `pnpm build` - Build for production
- `pnpm lint` - Run Biome linter/checker (no auto-fix)
- `pnpm fix` - Run Biome lint with auto-fix
- `pnpm format` - Format code with Biome
- No test suite currently exists

## Code Style & Formatting
- **Formatter**: Biome with 2-space indentation
- **Linter**: Biome with Next.js and React recommended rules enabled
- **TypeScript**: Strict mode enabled, no implicit any
- **Imports**: Auto-organize imports (Biome assist enabled), use `@/*` path alias for src
- **Tailwind**: Sorted classes enforced via `useSortedClasses` rule, use `cn()` utility from `@/lib/utils` for conditional classes
- **Components**: Use shadcn/ui patterns - separate variant logic with CVA, export named functions
- **Types**: Define types inline or with `type` keyword, use explicit return types for exported functions
- **Naming**: camelCase for variables/functions, PascalCase for components/types, kebab-case for files

## Pre-commit Hooks
- Husky runs `lint-staged` on commit
- Auto-runs `biome check` and `biome format --write` on staged files
