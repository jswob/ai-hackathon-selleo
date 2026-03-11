# CLAUDE.md

## Project Overview

A starter template for full-stack TypeScript applications using Bun, Elysia, React, and Drizzle ORM.

## Monorepo Structure

```
bun-elysia-react-template/
├── apps/web/                  # React frontend (Vite, TanStack Query)
├── apps/api/                  # Elysia API server (PostgreSQL, Drizzle ORM)
├── services/                  # Auxiliary microservices (e.g. Python FastAPI + OR-Tools, Go services)
├── packages/config/           # Shared ESLint, TypeScript, Prettier configs
└── packages/drizzle-fixtures/ # Type-safe test fixtures for Drizzle ORM
```

- **web** talks to **api** via Eden Treaty (type-safe HTTP client derived from Elysia's type export)
- **api** owns the PostgreSQL database through Drizzle ORM (schema, migrations, queries)
- **services/** is the conventional location for auxiliary microservices — for example, a Python FastAPI service using OR-Tools for optimization, or a Go service for background processing. Each service is self-contained with its own Dockerfile.
- **packages/config** provides shared ESLint, TypeScript, and Prettier base configs
- **packages/drizzle-fixtures** provides `createFixture` / `composeFactory` for type-safe test data
- Each sub-directory has its own `CLAUDE.md` with app-specific patterns and commands

## Root Commands

| Command            | Description                                 |
| ------------------ | ------------------------------------------- |
| `bun dev`          | Start web + API in dev mode with hot reload |
| `bun build`        | Build both apps for production              |
| `bun run test`     | Run tests for all applications              |
| `bun lint`         | Run ESLint + typecheck across the project   |
| `bun lint:fix`     | Auto-fix ESLint issues                      |
| `bun typecheck`    | TypeScript type checking only               |
| `bun format`       | Format code with Prettier                   |
| `bun format:check` | Check formatting without changes            |

## Import/Export Rules

**ALWAYS use official package exports. NEVER import from internal paths.**

- Correct: `import type { Item } from '@meetings-scheduler/api/types';`
- Wrong: `import { items } from '@meetings-scheduler/api/src/db/schema/items';`

When adding new exports to a package:

1. Add the subpath export to that package's `package.json` `"exports"` field
2. Import using the new subpath — no other config needed

## Testing Conventions

- Test files MUST be collocated with source files: `[filename].test.ts` / `.test.tsx`. Never use `__tests__` folders.
- Integration tests import `test`, `expect`, `describe` from `src/test/test-context` (never from `vitest` directly).
- Use `@meetings-scheduler/drizzle-fixtures` (`createFixture` / `composeFactory`) for all test data. Every new table needs a fixture file.

## Hard Rules

### NEVER Do

- **Run `db:generate` or `db:generate:custom`** — migration files are production artifacts created by the user only
- **Use plain `bun db:push`** — always use `bun db:push:safe` (auto-snapshots before pushing)

### ALWAYS Do

- **Use `bun db:push:safe`** for schema changes (snapshots automatically)
- **Run `bun db:base`** before major database experiments (creates protected baseline snapshot)
- **Use package exports** (`@meetings-scheduler/...`) — never cross-package internal paths
- **Collocate test files** next to source files
- **Use `@meetings-scheduler/drizzle-fixtures`** for test data — one fixture per table
- **Include `--env-file=../../.env`** in all `apps/api` package.json scripts that use `bun` or `drizzle-kit` — without it, Bun only looks for `.env` in `apps/api/` (which doesn't exist) and env vars fall back to wrong defaults

### ESLint Disables

Use inline comments only (never block-level disables). Always provide a reason:

```typescript
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Reason: Vitest expect.objectContaining returns any type
```
