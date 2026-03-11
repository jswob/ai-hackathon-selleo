# Development Workflow - Reference

Reference for feature development flow, TDD, running checks, database snapshots, seeding, and new model checklists.

**When to Use:** Starting a new feature, adding a database model, running checks, understanding the TDD cycle, managing database state during development.

## Table of Contents

- [Feature Development Flow](#feature-development-flow)
- [TDD Flow](#tdd-flow)
- [Running Targeted Checks](#running-targeted-checks)
- [Database Snapshot Workflow](#database-snapshot-workflow)
- [Seeding](#seeding)
- [New Model Checklist](#new-model-checklist)
- [JSDoc Documentation](#jsdoc-documentation)

---

## Feature Development Flow

Step-by-step sequence for building a complete API feature end-to-end:

1. **Schema** — Create/update Drizzle schema in `src/db/schema/[name].ts`
2. **Barrel export** — Re-export table + types from `src/db/schema/index.ts`
3. **Push** — Run `bun db:push:safe` (auto-snapshots before pushing)
4. **Fixture** — Create `src/test/fixtures/[name].fixture.ts` using `createFixture` from `@meetings-scheduler/drizzle-fixtures` with `@faker-js/faker` for field resolvers
5. **Register** — Add fixture to `src/test/fixtures/index.ts` via `composeFactory`
6. **Red** — Write failing tests (see [TDD Flow](#tdd-flow))
7. **Green** — Implement route handler to make tests pass. If the handler exceeds ~30 lines or has multi-phase logic (fetch-then-validate-then-write), extract business logic into `service.ts` as a plain async function returning `ServiceResult<T>` (see ELYSIA.md § Service Layer Pattern)
8. **Refactor** — Clean up while tests stay green. Add JSDoc to non-trivial service, helper, validation, and utility functions (see [JSDoc Documentation](#jsdoc-documentation))
9. **Check** — Run targeted checks in strict order (see [Running Targeted Checks](#running-targeted-checks))
10. **Seed** — Update `src/db/seed.ts` if the table needs dev data

**Recommended folder structure for feature modules:**

```
src/modules/[feature]/
  ├── index.ts           (Elysia route definitions — HTTP layer)
  ├── service.ts         (business logic — ONLY when handler exceeds ~30 lines or has multi-phase logic)
  ├── validation.ts      (pure validation functions — no DB access)
  └── [feature].test.ts  (collocated integration tests)
```

> `service.ts` is created only when a handler exceeds ~30 lines of non-trivial logic, OR when logic is shared across modules. Simple CRUD stays inline in `index.ts`. See ELYSIA.md § Service Layer Pattern.

Compose into the main app via `.use()`:

```typescript
import { featureRoutes } from './modules/feature';
const app = new Elysia().use(featureRoutes);
```

---

## TDD Flow

**Two-level testing model:**

- **Unit tests** — Services, utils, pure logic. No database. Standard vitest imports (`import { test, expect } from 'vitest'`).
- **Integration tests** — Routes + DB via transaction isolation. Import from `src/test/test-context`. Use `factory` for data, `tx` for queries, `app.handle()` for HTTP simulation.

**Red-Green-Refactor cycle:**

### 1. Red — Write a failing test

```typescript
import { test, expect, describe } from 'src/test/test-context';

describe('POST /api/items', () => {
	test('creates an item and returns 201', async ({ factory, tx }) => {
		const res = await createApp(tx).handle(
			new Request('http://localhost/api/items', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: 'Test Item' }),
			})
		);
		expect(res.status).toBe(201);
		const data = await res.json();
		expect(data).toMatchObject({ name: 'Test Item' });
	});
});
```

### 2. Green — Implement the minimum to pass

```typescript
// src/modules/items/index.ts
const itemRoutes = new Elysia({ prefix: '/api/items' }).post(
	'/',
	async ({ body, db }) => {
		const [item] = await db.insert(items).values(body).returning();
		return item;
	},
	{ body: t.Object({ name: t.String() }) }
);
```

### 3. Refactor — Improve while tests stay green

Extract service logic, add validation details, improve error handling — re-run tests after each change.

> **Rule:** Always import `test`, `expect`, `describe` from `src/test/test-context` in integration tests, never from `vitest` directly. The test context provides `tx`, `factory`, and `db` fixtures.

See TESTING.md for full fixture API, test context setup, and transaction isolation details.

---

## Running Targeted Checks

**Prescribed strict order:**

1. **`bun api:typecheck`** — Catch type errors early (fast, targeted feedback)
2. **`bun format`** — ESLint fix + Prettier + Ruff (modifies files in place)
3. **`bun run test`** — Run all tests once (NOT `bun test:api` which starts watch mode)
4. **`bun lint`** — Final gate (includes typecheck again, plus ESLint strict mode + solver lint)

### Fix Flow vs Verify Flow

| Step | Fix Flow (during dev)       | Verify Flow (CI / read-only)   |
| ---- | --------------------------- | ------------------------------ |
| 1    | `bun api:typecheck`         | `bun api:typecheck`            |
| 2    | `bun format` (writes fixes) | `bun format:check` (read-only) |
| 3    | `bun run test`              | `bun run test`                 |
| 4    | `bun lint`                  | `bun lint`                     |

> **Note:** `bun lint` re-runs typecheck internally. This is intentional as a final comprehensive gate that also includes ESLint strict mode and solver lint.

### Command Reference

| Command             | What It Does                            | When to Use                 |
| ------------------- | --------------------------------------- | --------------------------- |
| `bun api:typecheck` | TypeScript type check for API app       | First check during dev      |
| `bun typecheck`     | TypeScript check for all packages       | Full project verification   |
| `bun format`        | ESLint fix + Prettier + Ruff format     | During dev (modifies files) |
| `bun format:check`  | Same checks, read-only                  | CI / verify without changes |
| `bun run test`      | Run all vitest tests once               | After code changes          |
| `bun test:api`      | API tests in watch mode                 | Interactive development     |
| `bun lint`          | ESLint strict + typecheck + solver lint | Final verification gate     |
| `bun lint:fix`      | ESLint auto-fix + solver fix            | Fix lint issues             |

### Solver Test Restrictions

| Command                     | Status    | Duration |
| --------------------------- | --------- | -------- |
| `bun solver:test:fast`      | Allowed   | Fast     |
| `bun solver:test`           | NEVER run | 30s+     |
| `bun solver:test:slow`      | NEVER run | 30s+     |
| `bun solver:test:benchmark` | NEVER run | 30s+     |

---

## Database Snapshot Workflow

Docker-volume-based instant snapshots. No SQL dumps — snapshots are filesystem-level copies of the PostgreSQL data directory.

### Command Reference

| Command                  | Description                         | Safety                      |
| ------------------------ | ----------------------------------- | --------------------------- |
| `bun db:base`            | Create protected baseline snapshot  | Safe — non-destructive      |
| `bun db:push:safe`       | Auto-snapshot + push schema changes | **ALWAYS use this**         |
| `bun db:push`            | Push without snapshot               | **NEVER use directly**      |
| `bun db:undo`            | Revert last `db:push:safe`          | Restores previous snapshot  |
| `bun db:reset`           | Restore baseline snapshot           | Resets to `db:base` state   |
| `bun db:snapshot [name]` | Create named snapshot               | Manual checkpoint           |
| `bun db:restore [name]`  | Restore named snapshot              | Manual restore              |
| `bun db:snapshot:list`   | List all snapshots                  | Inspect available snapshots |
| `bun db:clean --force`   | Remove all snapshots                | Full cleanup                |

### Typical Session Workflow

```
# Starting a new feature
bun db:base                    # Protect current state
bun db:push:safe               # Push schema changes (auto-snapshots first)

# Something went wrong
bun db:undo                    # Revert last push

# Want to experiment
bun db:snapshot experiment-1   # Save current state
# ... try things ...
bun db:restore experiment-1    # Restore if needed

# Reset everything
bun db:reset                   # Back to baseline
```

### Hard Rules

1. **ALWAYS** use `bun db:push:safe` — never plain `bun db:push`
2. **NEVER** run `bun db:generate` or `bun db:generate:custom` — only the user creates migration files
3. **ALWAYS** run `bun db:base` before major experiments
4. Migration files are **production artifacts** — created intentionally by the user only

---

## Seeding

**Purpose:** Realistic development data for manual testing and UI development.

**Location:** `apps/api/src/db/seed.ts` — run via `bun db:seed`.

**When to seed:**

- After `bun db:push:safe` (schema changed, tables may be empty)
- After `bun db:reset` (baseline restored, dev data lost)
- When starting fresh on a new machine

**Convention:** Always update the seed file when adding new tables so the dev database stays populated with representative data.

**Seeding vs Test Data:**

- **Seed data** — development / UI / manual testing. Uses `db.insert()` in `seed.ts`.
- **Test data** — automated tests only. Uses `@meetings-scheduler/drizzle-fixtures` exclusively.

> **Future direction:** Migrate to `drizzle-seed` package for deterministic, reproducible seeding (not yet installed — current seed uses plain `db.insert()`).

---

## New Model Checklist

Condensed checklist for adding a new database model end-to-end:

1. **Schema file** — `src/db/schema/[name].ts` (use common column patterns from `common.ts`)
2. **Barrel export** — Add to `src/db/schema/index.ts`
3. **Type exports** — Export `$inferSelect` / `$inferInsert` types
4. **Relations** — Define `relations()` if foreign keys exist
5. **Schema deps** — Update `SCHEMA_DEPENDENCIES` in `scripts/check-schema-changes.ts` with new schema imports
6. **Push** — `bun db:push:safe`
7. **Fixture** — `src/test/fixtures/[name].fixture.ts` using `createFixture` from `@meetings-scheduler/drizzle-fixtures` with `@faker-js/faker` fields
8. **Register fixture** — Add to `src/test/fixtures/index.ts` via `composeFactory`
9. **Tests** — Write collocated tests (import from `src/test/test-context`)
10. **Route handler** — In `src/routes/` or `src/modules/`
11. **Compose** — Mount into main app via `.use()`
12. **Seed** — Add dev data to `src/db/seed.ts`
13. **Check** — Run strict order: `bun api:typecheck` -> `bun format` -> `bun run test` -> `bun lint`

---

## JSDoc Documentation

Rules for when and how to write JSDoc comments in the API codebase.

### Functions That MUST Have JSDoc

- **Service files** (`service.ts`) — business logic functions
- **Helper files** (`rule-helpers.ts`, etc.) — shared logic used across handlers
- **Validation files** (`validation.ts`) — pure validation functions (not TypeBox schema definitions)
- **Utility files** (`utils/*.ts`) — shared utilities
- **Reusable schema objects** used across multiple files (e.g., `timestamps`, `uuidPrimaryKey` in `common.ts`)

### Functions That Must NOT Have JSDoc

- Route handlers in `index.ts` — the route path + method + validation schema already document intent
- Schema definitions (`pgTable(...)` calls) — the table/column names are self-documenting
- Database connection setup
- Test files and fixtures
- Trivial one-liner functions where the name says everything (e.g., `ok()`, `fail()`)

### Format

```typescript
/**
 * Purpose sentence explaining what and why.
 * @param paramName - Description of the parameter
 * @returns Description (only when return value has nuances beyond the type signature)
 * @throws ErrorClass - Description (only for actual thrown exceptions)
 */
```

### Tag Rules

| Tag        | When to Include                                                                                                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@param`   | **Always** — for every parameter                                                                                                                                                                        |
| `@returns` | **Only** when the return type alone doesn't convey what's returned (e.g., "returns enriched rule with conditions and requirement populated"). Skip when the TypeScript return type is self-explanatory. |
| `@throws`  | **Only** for actual thrown exceptions (`throw new Error(...)`) — NOT for `fail()` error codes from `ServiceResult`. Most service functions return errors via `fail()`, those are not `@throws`.         |
| `@example` | **Never** — bloats docs without adding value in this codebase                                                                                                                                           |

### Good Examples

**Service function** — all params documented, `@returns` adds context beyond the type:

```typescript
/**
 * Update a rule's top-level fields, conditions, and requirement in a single transaction.
 * @param db - Database connection or transaction
 * @param ruleId - UUID of the rule to update
 * @param input - Partial fields to patch (only provided fields are updated)
 * @returns Updated rule with conditions and requirement populated
 */
export async function updateRule(
  db: DatabaseConnection,
  ruleId: string,
  input: UpdateRuleInput
): Promise<ServiceResult<...>> {
```

**Helper function** — `@returns` skipped because `ServiceResult<Map<...>>` is self-explanatory:

```typescript
/**
 * Collect all trait keys referenced by conditions and requirement, fetch their
 * definitions from the database, and verify none are unknown.
 * @param db - Database connection or transaction
 * @param conditions - Condition inputs referencing trait keys
 * @param requirement - Requirement input referencing a trait key
 */
export async function resolveTraitDefinitions(
  db: DatabaseConnection,
  conditions?: ConditionInput[],
  requirement?: RequirementInput
): Promise<ServiceResult<Map<string, TraitDefinitionInfo>>> {
```

**Validation function** — pure logic, no DB, `@returns` skipped:

```typescript
/**
 * Validate that a condition's operator is compatible with its trait's data type,
 * and that required position/value fields are present for the given rightType.
 * @param condition - The condition input to validate
 * @param traitDefinitionsMap - Map of trait key to definition (for data type lookup)
 * @param index - Position in the conditions array (used in error messages)
 */
export function validateCondition(
  condition: ConditionInput,
  traitDefinitionsMap: Map<string, TraitDefinitionInfo>,
  index: number
): ValidationResult {
```

### Bad Examples

**Over-documented** — `@returns`, `@throws` on a simple util that returns an obvious type:

```typescript
// BAD: @returns and @throws add no value here
/**
 * Map a ServiceError to an HTTP status code and response body.
 * @param error - The service error to map
 * @returns An object with status number and body containing error message
 * @throws TypeError - If error code is not in the status map
 */
export function mapError(error: ServiceError) { ... }

// GOOD: concise, @param only
/**
 * Map a ServiceError to an HTTP status code and response body.
 * @param error - The service error to map
 */
export function mapError(error: ServiceError) { ... }
```

**JSDoc on route handler** — route path + validation schema already document intent:

```typescript
// BAD: don't JSDoc route handlers
/**
 * Create a new rule with conditions and requirement.
 * @param body - The request body containing rule data
 */
.post('/', async ({ body, db }) => { ... }, { body: CreateRuleSchema })

// GOOD: no JSDoc needed — the route, method, and schema speak for themselves
.post('/', async ({ body, db }) => { ... }, { body: CreateRuleSchema })
```

---

## Related Files

- SKILL.md — routing hub with decision tree, pattern index, common pitfalls
- ELYSIA.md — Elysia HTTP framework routes, lifecycle, plugins, DI, guards
- VALIDATION.md — validation reference: TypeBox API, targets, layers, rules
- DRIZZLE.md — Drizzle ORM schema, queries, transactions, connections
- TESTING.md — test context, fixtures, route testing patterns
