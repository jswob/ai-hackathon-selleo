# Web Application

React SPA frontend with Vite, TanStack Router, TanStack Query, Eden Treaty. Dev port 5173.

## Project Structure

- `src/main.tsx` — React entry point
- `src/router.ts` — TanStack Router instance
- `src/routeTree.gen.ts` — auto-generated route tree (do not edit)
- `src/components/` — reusable UI components, one directory per component (Component.tsx + index.ts + optional test)
- `src/hooks/api/` — TanStack Query hooks (query options + useQuery), query key factories
- `src/lib/` — Eden Treaty client (`api.ts`), error helpers (`api-utils.ts`), query client config, `cn()` utility
- `src/providers/` — React context providers (QueryProvider)
- `src/routes/` — file-based TanStack Router routes
- `src/test/` — Vitest setup
- `e2e/` — Playwright E2E tests

## Key Patterns

- **Routes**: file-based in `src/routes/`, use `createFileRoute()`. Auto code-splitting. Layout routes use `route.tsx` files with `<Outlet />`.
- **Route redirects**: index routes use `beforeLoad` with `throw redirect()` to forward to default sub-pages.
- **Query hooks**: in `hooks/api/`, export `queryOptions()` for loaders + `useQuery()` hooks.
- **Query keys**: hierarchical factories in `hooks/api/keys.ts`.
- **API client**: Eden Treaty in `lib/api.ts`, typed against `App`. Error handling via `extractErrorMessage()`.
- **Components**: `src/components/[Name]/` with barrel exports. Each directory has implementation, tests, types.
- **Styling**: Tailwind CSS v4 + CVA + `cn()` utility in `lib/utils.ts`.
- **Icons**: `lucide-react` for all icons.
- **Tooltips**: `@floating-ui/react` for floating UI elements.
- **Testing**: collocate tests as `[name].test.tsx` inside component directories.
- **Path alias**: `@/` maps to `src/`.
- **Query config**: stale 5min, GC 10min, retry 3x (no retry on 4xx), window focus refetch disabled.
- **Modal**: `@headlessui/react` Dialog — `<Modal open onClose title size footer>`. Size variants: sm/md/lg/xl. Footer slot for action buttons.
- **SelectInput**: three modes via props — single (`<SelectInput>`), searchable (`searchable`), multi-select (`multiple`). Single uses Headless UI Listbox, searchable/multi use Combobox.
- **Feature components**: route-specific components live in `routes/.../‑components/` directories (TanStack Router ignores `-` prefixed dirs).
- **Z-Index Scale**: `z-10` sticky in-page elements (table headers) → `z-40` modal backdrops → `z-50` modal panels → `z-60` popovers/dropdowns/select menus → `z-70` tooltips. New layers must use this scale; never introduce ad-hoc values.
- **Multi-step mutations**: create entity first, then configure associations in follow-up calls. Wrap config steps in try/catch to provide context on partial failure.
- **API hook mocking**: for component tests, `vi.mock('@/hooks/api')` and mock return values of hooks. Wrap render in `QueryClientProvider` with a fresh `QueryClient`.
- **Test setup mocks**: `Element.prototype.getAnimations = () => []` in `test/setup.ts` is required for `@headlessui/react` transition components.

## Dev Commands

All commands run from the monorepo root:

| Command             | Description                     |
| ------------------- | ------------------------------- |
| `bun web:dev`       | Start Vite dev server           |
| `bun web:build`     | Build for production            |
| `bun web:typecheck` | TypeScript type checking        |
| `bun test:web`      | Run Vitest tests                |
| `bun e2e`           | Run Playwright E2E tests        |
| `bun e2e:ui`        | Playwright UI mode              |
| `bun e2e:headed`    | Run E2E tests in headed browser |
| `bun e2e:install`   | Install Playwright browsers     |

## Environment Variables

| Variable       | Description          | Default                 |
| -------------- | -------------------- | ----------------------- |
| `VITE_API_URL` | API server URL       | `http://localhost:3001` |
| `WEB_PORT`     | Vite dev server port | `5173`                  |

## Development Rules

### Testing

- **ALWAYS** write comprehensive tests for developed functionality considering our best practices
- **ALWAYS** follow TDD (red-green-refactor): write a failing test first, implement the minimum code to pass, then refactor
- **ALWAYS** write tests incrementally per plan phase — not all at the beginning or all at the end
- **NEVER** write E2E (Playwright) tests unless explicitly requested by the developer

### Documentation

- **ALWAYS** prefer JSDoc over inline comments — avoid inline comments whenever possible
- JSDoc should describe **what** a function does, not implementation details
- JSDoc should be concise; **NEVER** include `@example` blocks

### ESLint

- When disabling an ESLint rule inline, **ALWAYS** provide a reason in the comment
