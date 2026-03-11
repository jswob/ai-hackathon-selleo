# Development Workflow — Reference

Conventions for project structure, feature development flow, and checklists for adding pages, components, and hooks.

**When to Use:** Starting a new feature, adding pages/components/hooks, understanding file organization, reviewing import/export conventions.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Feature Development Flow](#feature-development-flow)
- [New Page Checklist](#new-page-checklist)
- [New Component Checklist](#new-component-checklist)
- [New Hook Checklist](#new-hook-checklist)
- [Import/Export Rules](#importexport-rules)
- [Barrel Export Conventions](#barrel-export-conventions)
- [Deep Dive](#deep-dive)

---

## Project Structure

Type-based directory layout — group by kind (components, hooks, pages), not by feature.

```
src/
├── components/
│   └── [Name]/
│       ├── [Name].tsx
│       ├── [Name].test.tsx
│       └── index.ts
├── hooks/
│   ├── api/
│   │   ├── keys.ts
│   │   ├── use[Resource].ts
│   │   ├── use[Resource].test.ts
│   │   └── index.ts
│   └── use[Name].ts
├── pages/
│   └── [Name]/
│       ├── [Name].tsx
│       ├── [Name].test.tsx
│       └── index.ts
├── routes/
│   └── (file-based routing)
├── contexts/
│   └── [Name]Context.tsx
├── lib/
│   ├── api.ts
│   ├── api-utils.ts
│   └── utils.ts
├── providers/
│   └── QueryProvider.tsx
└── test/
    ├── setup.ts
    └── utils.ts
```

### Naming Conventions

| Type           | Convention                       | Example                                  |
| -------------- | -------------------------------- | ---------------------------------------- |
| Components     | PascalCase directory + file      | `components/ProductCard/ProductCard.tsx` |
| Pages          | PascalCase directory + file      | `pages/Dashboard/Dashboard.tsx`          |
| Hooks          | camelCase with `use` prefix      | `hooks/api/useItems.ts`                  |
| Utilities      | camelCase                        | `lib/utils.ts`, `lib/api-utils.ts`       |
| Contexts       | PascalCase with `Context` suffix | `contexts/AuthContext.tsx`               |
| Tests          | Collocated `[name].test.ts(x)`   | `ProductCard.test.tsx`                   |
| Barrel exports | `index.ts`                       | `components/ProductCard/index.ts`        |

**Test colocation:** Test files MUST be next to their source file. Never use `__tests__/` directories. See [TESTING.md § Setup](TESTING.md#setup) for test configuration details.

---

## Feature Development Flow

Step-by-step sequence for building a complete frontend feature:

1. **Types** — Define TypeScript interfaces if the feature has complex data shapes (inline or in `types.ts`)
2. **API Hook** — Create TanStack Query hook in `hooks/api/use[Resource].ts` wrapping the API client
3. **Register Hook** — Re-export from `hooks/api/index.ts`
4. **Red** — Write failing component/hook tests
5. **Green** — Implement component(s) to make tests pass
6. **Refactor** — Clean up, extract custom hooks, add JSDoc to non-trivial helpers
7. **Page** — Create page component composing the feature components
8. **Route** — Add route definition (file-based or manual depending on router setup)
9. **Check** — Run targeted checks: typecheck → format → test → lint
10. **E2E** — Add Playwright test for critical user flows

**Key differences from backend:** No schema/migration/fixture steps. API hooks replace route handlers as the data layer. Components are the implementation target.

For TDD patterns (AAA, Red-Green-Refactor cycle), see [TESTING.md § Component Testing Fundamentals](TESTING.md#component-testing-fundamentals). For API hook patterns (queryOptions factories, cache invalidation), see [QUERY_EDEN.md § queryOptions Factory](QUERY_EDEN.md#queryoptions-factory).

---

## New Page Checklist

1. **API hook(s)** — Create `hooks/api/use[Resource].ts` if the page needs server data
2. **Register hook** — Re-export from `hooks/api/index.ts`
3. **Red** — Write failing page test in `pages/[Name]/[Name].test.tsx`
4. **Component(s)** — Create feature components in `components/[Name]/` if UI is complex
5. **Green** — Create `pages/[Name]/[Name].tsx` composing hooks and components
6. **Barrel** — Create `pages/[Name]/index.ts` barrel export
7. **Route** — Add route definition
8. **Refactor** — Extract shared components, add JSDoc to helpers
9. **E2E** — Add Playwright test in `e2e/tests/[name].spec.ts` for critical flows
10. **Check** — Run: typecheck → format → test → lint

---

## New Component Checklist

1. **Directory** — Create `components/[Name]/`
2. **Red** — Write failing test in `components/[Name]/[Name].test.tsx`
3. **Green** — Create `components/[Name]/[Name].tsx` with minimal implementation
4. **Barrel** — Create `components/[Name]/index.ts` exporting the component
5. **Refactor** — Add styling, extract sub-components if needed
6. **Check** — Run: typecheck → format → test → lint

### Component Directory Structure

```
components/[Name]/
├── [Name].tsx           # Component implementation
├── [Name].test.tsx      # Collocated tests
├── [SubComponent].tsx   # Sub-components (optional)
└── index.ts             # Barrel export
```

For when to extract sub-components or split files, see [REACT.md § Component Complexity & Refactoring](REACT.md#component-complexity--refactoring).

---

## New Hook Checklist

### API Hook (TanStack Query)

1. **Create** — `hooks/api/use[Resource].ts`
2. **Red** — Write failing test in `hooks/api/use[Resource].test.ts`
3. **Mock** — Mock API client at module level
4. **Green** — Implement hook with `useQuery`/`useMutation`
5. **Register** — Re-export from `hooks/api/index.ts`
6. **Check** — Run: typecheck → format → test → lint

For queryOptions factory pattern and cache invalidation, see [QUERY_EDEN.md § queryOptions Factory](QUERY_EDEN.md#queryoptions-factory).

### Custom Hook (Non-API)

1. **Create** — `hooks/use[Name].ts` (or inline in component if single-use)
2. **Red** — Write failing test in `hooks/use[Name].test.ts`
3. **Green** — Implement hook
4. **Extract** — Move from component file if originally inline
5. **Check** — Run: typecheck → format → test → lint

For hook testing patterns (renderHook, waitFor), see [TESTING.md § Hook Testing](TESTING.md#hook-testing).

---

## Import/Export Rules

### Package Exports (Cross-Package)

Always use official package exports, never internal paths:

```ts
// GOOD — official export
import type { Item } from 'your-api-package/types';

// BAD — internal path
import { items } from 'your-api-package/src/db/schema/items';
```

When adding new exports: add subpath to the source package's `package.json` `"exports"` field, then import via the new subpath.

### Path Alias

Use `@/` alias for `src/` imports within the app:

```ts
import { QueryProvider } from '@/providers/QueryProvider';
import { client } from '@/lib/api';
import { cn } from '@/lib/utils';
```

### Type Imports

Always use `import type` for type-only imports:

```ts
import type { FC, ReactNode } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
```

Enforced by ESLint: `@typescript-eslint/consistent-type-imports`

### Import Order

Enforced by ESLint `import/order`:

1. **builtin** — Node.js builtins (rare in frontend)
2. **external** — npm packages (`react`, `@tanstack/react-query`)
3. **internal** — workspace packages
4. **parent** — parent directory (`../`)
5. **sibling** — sibling files (`./`)
6. **index** — index imports

Each group alphabetized, newlines between groups.

---

## Barrel Export Conventions

Barrel files (`index.ts`) re-export public API from a directory:

```ts
// components/ProductCard/index.ts
export { ProductCard } from './ProductCard';
export type { ProductCardProps } from './ProductCard';
```

### When to Create Barrels

| Scenario                                | Barrel?                              |
| --------------------------------------- | ------------------------------------ |
| Component directory with sub-components | Yes                                  |
| Single-file utility                     | No (import directly)                 |
| `hooks/api/` directory                  | Yes (re-export all hooks)            |
| Page directory                          | Optional (pages often imported once) |

**Avoid barrel imports in performance-critical code** — deep barrel chains can hurt tree-shaking. Import directly when bundle size matters. See [REACT.md § Avoid Barrel File Imports](REACT.md#avoid-barrel-file-imports).

---

## Deep Dive

**Related Skill Files:**

| File                           | Focus                                                          |
| ------------------------------ | -------------------------------------------------------------- |
| [REACT.md](REACT.md)           | Component patterns, hooks, performance, refactoring thresholds |
| [STATE.md](STATE.md)           | State management decision tree, Context, useReducer            |
| [ROUTING.md](ROUTING.md)       | TanStack Router, route files, data loading                     |
| [QUERY_EDEN.md](QUERY_EDEN.md) | TanStack Query + Eden Treaty, hook patterns                    |
| [VALIDATION.md](VALIDATION.md) | Zod forms, search params, API responses                        |
| [STYLING.md](STYLING.md)       | Tailwind v4, CVA variants, cn() utility                        |
| [TESTING.md](TESTING.md)       | Vitest + React Testing Library + Playwright                    |
