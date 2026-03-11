# Bun + Elysia + React + Drizzle Template

A full-stack TypeScript starter template for building web applications with Bun, Elysia, React, and PostgreSQL.

## Tech Stack

| Layer     | Technology                                                          |
| --------- | ------------------------------------------------------------------- |
| Runtime   | [Bun](https://bun.sh) v1.2+                                         |
| API       | [Elysia](https://elysiajs.com) (type-safe HTTP framework)           |
| Frontend  | [React](https://react.dev) + [Vite](https://vite.dev)               |
| Routing   | [TanStack Router](https://tanstack.com/router) (file-based)         |
| Data      | [TanStack Query](https://tanstack.com/query)                        |
| API Types | [Eden Treaty](https://elysiajs.com/eden/treaty.html)                |
| Database  | PostgreSQL via [Drizzle ORM](https://orm.drizzle.team)              |
| Styling   | [Tailwind CSS v4](https://tailwindcss.com) + CVA                    |
| Testing   | [Vitest](https://vitest.dev) + [Playwright](https://playwright.dev) |

## Quick Start

**Prerequisites:** Bun v1.2+, Docker

```bash
# Clone and install
git clone <repo-url>
cd bun-elysia-react-template
bun install

# Configure environment
cp .env.example .env

# Start databases
bun db:up

# Start development servers
bun dev
```

The web app runs at `http://localhost:5173` and the API at `http://localhost:3001`.

## Project Structure

```
├── apps/web/                  # React SPA (Vite, TanStack Router, TanStack Query)
├── apps/api/                  # Elysia API server (PostgreSQL, Drizzle ORM)
├── services/                  # Auxiliary microservices (add as needed)
├── packages/config/           # Shared ESLint, TypeScript, Prettier configs
└── packages/drizzle-fixtures/ # Type-safe test fixtures for Drizzle ORM
```

## Key Commands

| Command            | Description                                 |
| ------------------ | ------------------------------------------- |
| `bun dev`          | Start web + API in dev mode with hot reload |
| `bun build`        | Build both apps for production              |
| `bun test`         | Run all tests                               |
| `bun test:web`     | Run frontend Vitest tests                   |
| `bun test:api`     | Run API Vitest tests                        |
| `bun lint`         | Run ESLint + typecheck                      |
| `bun lint:fix`     | Auto-fix ESLint issues                      |
| `bun typecheck`    | TypeScript type checking only               |
| `bun format`       | Format code with Prettier                   |
| `bun db:up`        | Start PostgreSQL containers                 |
| `bun db:push:safe` | Apply schema changes (with snapshot)        |
| `bun e2e`          | Run Playwright E2E tests                    |

## Using This Template

### Add your first domain module

1. **Define the schema** — create `apps/api/src/db/schema/your-entity.ts` using helpers from `common.ts`
2. **Create the fixture** — create `apps/api/src/test/fixtures/your-entity.ts` using `createFixture()`
3. **Add the module** — create `apps/api/src/modules/your-entity/index.ts` with `createYourEntityRoute(db)`
4. **Register the module** — add `.use(createYourEntityRoute(db))` in `apps/api/src/index.ts`
5. **Add a query hook** — create `apps/web/src/hooks/api/useYourEntity.ts`
6. **Add a route** — create `apps/web/src/routes/your-entity/index.tsx`

### Add an auxiliary service

Place it in `services/your-service/` with its own `Dockerfile`. Add it to `docker-compose.yml` with a named profile if it's optional. Add start scripts to the root `package.json`.

## Database Workflow

```bash
# Make schema changes
bun db:push:safe     # Applies changes + auto-snapshots the previous state
bun db:undo          # Instantly revert the last push
bun db:base          # Save a named baseline before major experiments
bun db:reset         # Restore to the baseline
```

See `apps/api/CLAUDE.md` for the full database commands reference.
