---
name: elysia-drizzle-api-best-practices
description: Elysia Drizzle ORM API best practices reference. Covers Elysia route composition plugin lifecycle validation handler error handling guard scope dependency injection type export, Drizzle schema pgTable column types relations relational queries transactions insert update delete select database connection type exports, development workflow TDD database snapshot seeding drizzle-fixtures typecheck format lint, testing TDD Vitest test context transaction isolation route testing createFixture composeFactory traits fixture composition drizzle-fixtures, JSDoc documentation comments.
---

# Elysia + Drizzle API

Routing hub for Elysia, Drizzle ORM, development workflow, and testing references. All implementation detail lives in the reference files below — this file maps your need to the right one.

**When to Use:** Starting any API task involving Elysia routes, Drizzle queries, development workflow, or API testing. This file routes to the correct reference.

---

## Decision Tree

Find your task below and go to the indicated reference file.

**Elysia — HTTP framework, routing, middleware:**

| I need to...                                                | Go to                             |
| ----------------------------------------------------------- | --------------------------------- |
| Define routes with method chaining or grouping              | ELYSIA.md § Route Composition     |
| Validate body, query, params, headers, or response          | VALIDATION.md                     |
| Return status codes or access context properties            | ELYSIA.md § Handler Patterns      |
| Add request/response middleware (auth, logging, transforms) | ELYSIA.md § Lifecycle Hooks       |
| Handle errors globally or per-route                         | ELYSIA.md § Error Handling        |
| Compose modular routers with `.use()`                       | ELYSIA.md § Plugins               |
| Inject services, derive context, or resolve data            | ELYSIA.md § Dependency Injection  |
| Export app type for type-safe clients                       | ELYSIA.md § Type Export Pattern   |
| Scope hooks, schemas, or guards to route groups             | ELYSIA.md § Guard and Scope       |
| Extract complex handler logic into a service layer          | ELYSIA.md § Service Layer Pattern |

**Drizzle ORM — schema, queries, database:**

| I need to...                                               | Go to                               |
| ---------------------------------------------------------- | ----------------------------------- |
| Define tables, columns, indexes, or foreign keys           | DRIZZLE.md § Schema Definition      |
| Reuse common columns (id, timestamps, soft-delete)         | DRIZZLE.md § Common Columns Pattern |
| Export inferred types from table definitions               | DRIZZLE.md § Type Exports           |
| Write SELECT queries with filters, joins, or pagination    | DRIZZLE.md § Select Queries         |
| Insert rows with returning or upsert                       | DRIZZLE.md § Insert Queries         |
| Update rows with SQL expressions                           | DRIZZLE.md § Update Queries         |
| Delete rows with filter and returning                      | DRIZZLE.md § Delete Queries         |
| Define relations and use `db.query` with eager loading     | DRIZZLE.md § Relational Queries     |
| Use transactions with rollback or nested savepoints        | DRIZZLE.md § Transactions           |
| Configure database connection, schema injection, or casing | DRIZZLE.md § Database Connection    |

**Development Workflow — TDD, checks, database, seeding:**

| I need to...                                         | Go to                                    |
| ---------------------------------------------------- | ---------------------------------------- |
| Build a feature end-to-end (schema to route)         | WORKFLOW.md § Feature Development Flow   |
| Follow the red-green-refactor TDD cycle              | WORKFLOW.md § TDD Flow                   |
| Run typecheck, format, test, lint in the right order | WORKFLOW.md § Running Targeted Checks    |
| Snapshot, restore, undo, or reset the database       | WORKFLOW.md § Database Snapshot Workflow |
| Seed the dev database with realistic data            | WORKFLOW.md § Seeding                    |
| Add a new database model end-to-end                  | WORKFLOW.md § New Model Checklist        |
| Document non-trivial functions with JSDoc            | WORKFLOW.md § JSDoc Documentation        |

**Testing — TDD, fixtures, route testing:**

| I need to...                                          | Go to                                     |
| ----------------------------------------------------- | ----------------------------------------- |
| Follow the TDD workflow for API endpoints             | TESTING.md § TDD Workflow                 |
| Configure Vitest for API testing                      | TESTING.md § Vitest Configuration         |
| Set up test context with db, tx, and factory fixtures | TESTING.md § Test Context Pattern         |
| Understand transaction-based test isolation           | TESTING.md § Transaction Isolation        |
| Test Elysia routes without an HTTP server             | TESTING.md § Elysia Route Testing         |
| Write full integration tests (routes + database)      | TESTING.md § Route + Database Integration |
| Test service functions directly without HTTP          | TESTING.md § Service Function Testing     |
| Define reusable fixtures with `createFixture`         | TESTING.md § createFixture API            |
| Compose fixtures into a factory with `composeFactory` | TESTING.md § composeFactory + Builder     |
| Add named variations with traits and augmentations    | TESTING.md § Traits                       |
| Create related records via fixture composition        | TESTING.md § Fixture Composition          |

---

## Hard Rules

Non-negotiable conventions. Violations break tests, DX, or CI.

1. **ALWAYS** use `@meetings-scheduler/drizzle-fixtures` for test data (`createFixture` / `composeFactory`). Use `@faker-js/faker` for field resolvers. Create a fixture file per new table.
2. **ALWAYS** use `bun db:push:safe`, never plain `bun db:push`.
3. **NEVER** run `bun db:generate` or `bun db:generate:custom` — only the user creates migration files.
4. **ALWAYS** import `test`, `expect`, `describe` from `src/test/test-context` in integration tests, never from `vitest` directly.
5. **ALWAYS** use package exports (`@meetings-scheduler/...`), never internal cross-package paths.

---

## Pattern Index

Alphabetical index of key patterns and APIs across all reference files.

| Pattern / API                              | Reference                                |
| ------------------------------------------ | ---------------------------------------- |
| `@meetings-scheduler/drizzle-fixtures`     | TESTING.md § createFixture API           |
| `app.handle(new Request(...))`             | TESTING.md § Elysia Route Testing        |
| `bun db:base`                              | WORKFLOW.md § Database Snapshot Workflow |
| `bun db:push:safe`                         | WORKFLOW.md § Database Snapshot Workflow |
| `bun db:undo`                              | WORKFLOW.md § Database Snapshot Workflow |
| `composeFactory(fixtures)`                 | TESTING.md § composeFactory + Builder    |
| `createFixture({ table, fields, traits })` | TESTING.md § createFixture API           |
| `db.query.table.findMany({ with })`        | DRIZZLE.md § Relational Queries          |
| `db.transaction(async (tx) => ...)`        | DRIZZLE.md § Transactions                |
| `decorate()` / `state()`                   | ELYSIA.md § Dependency Injection         |
| `derive()` / `resolve()`                   | ELYSIA.md § Dependency Injection         |
| `export type App = typeof app`             | ELYSIA.md § Type Export Pattern          |
| `fail()`                                   | ELYSIA.md § Service Layer Pattern        |
| `guard({ schema, hooks }, app)`            | ELYSIA.md § Guard and Scope              |
| JSDoc conventions (service, helper, util)  | WORKFLOW.md § JSDoc Documentation        |
| `mapError()`                               | ELYSIA.md § Service Layer Pattern        |
| `new Elysia({ prefix })`                   | ELYSIA.md § Route Composition            |
| `ok()`                                     | ELYSIA.md § Service Layer Pattern        |
| `onConflictDoUpdate({ target, set })`      | DRIZZLE.md § Insert Queries              |
| `onError(({ code, error }) => ...)`        | ELYSIA.md § Error Handling               |
| `pgTable(name, columns)`                   | DRIZZLE.md § Schema Definition           |
| `relations(table, callback)`               | DRIZZLE.md § Relational Queries          |
| `.returning()`                             | DRIZZLE.md § Insert Queries              |
| `ServiceResult<T>`                         | ELYSIA.md § Service Layer Pattern        |
| `t.Object({...})` (TypeBox)                | VALIDATION.md § TypeBox Schema API       |
| `table.$inferSelect` / `$inferInsert`      | DRIZZLE.md § Type Exports                |
| `test.extend<T>()`                         | TESTING.md § Test Context Pattern        |
| `use()` (fixture composition)              | TESTING.md § Fixture Composition         |

---

## Common Pitfalls

1. **Internal path imports** — Always use package exports (`@meetings-scheduler/api/types`), never relative paths to source files across packages. See ELYSIA.md § Type Export Pattern.

2. **Missing `.returning()` on inserts/updates** — PostgreSQL returns nothing without `.returning()`. Always chain it to get auto-generated fields like `id` and `createdAt`. See DRIZZLE.md § Insert Queries.

3. **Missing schema barrel re-export** — New tables must be added to `src/db/schema/index.ts` barrel export or Drizzle won't discover them for migrations or `db.query`. See DRIZZLE.md § Type Exports.

4. **`TransactionRollbackError` not caught in test context** — The test `tx` fixture catches this error automatically. If you manually call `tx.rollback()` outside the fixture's try/catch, it will throw unhandled. See TESTING.md § Transaction Isolation.

5. **Factory bound to `db` not `tx`** — Fixture factories must receive the test transaction, not the global `db` connection. Data created with `db` persists after test rollback. See TESTING.md § Test Context Pattern.

6. **Hard-importing `db` in routes prevents DI** — Routes that import `db` directly from a module cannot be transaction-isolated in tests. Accept `db` via `decorate()` or a function parameter. See TESTING.md § Route + Database Integration and ELYSIA.md § Dependency Injection.

7. **`db.query` fails without `{ schema }` injection** — Relational queries (`db.query.users.findMany`) silently return empty results if `schema` isn't passed to `drizzle()`. See DRIZZLE.md § Database Connection and § Relational Queries.

8. **Test files not collocated** — Test files must be next to their source files (`users.ts` -> `users.test.ts`). Never use `__tests__` folders. See TESTING.md § TDD Workflow.

9. **Missing CORS plugin** — Cross-origin requests from the frontend will fail without the CORS plugin. Add `cors()` to the main Elysia app. See ELYSIA.md § Plugins.

10. **Missing fixture for new table** — Every new database table MUST have a corresponding fixture file using `createFixture` from `@meetings-scheduler/drizzle-fixtures`. See WORKFLOW.md § New Model Checklist.

11. **Using plain `db:push`** — Always use `bun db:push:safe` which auto-snapshots before pushing. Plain `db:push` risks data loss. See WORKFLOW.md § Database Snapshot Workflow.

12. **Running `db:generate`** — Never run `bun db:generate` or `bun db:generate:custom`. Migration files are production artifacts created intentionally by the user only. See WORKFLOW.md § Database Snapshot Workflow.

13. **Business logic in oversized handlers** — Route handlers exceeding ~30 lines or with multi-phase logic (fetch-then-validate-then-write) should extract business logic into `service.ts` as plain async functions returning `ServiceResult<T>`. Keep route handlers as thin HTTP adapters. See ELYSIA.md § Service Layer Pattern.

14. **Missing JSDoc on service/helper functions** — Non-trivial functions in `service.ts`, helper files, `validation.ts`, and `utils/` must have JSDoc with at minimum a purpose sentence and `@param` tags. Route handlers and schema definitions do not get JSDoc. See WORKFLOW.md § JSDoc Documentation.

---

## Reference Files

| File          | Lines | Focus                                                                        |
| ------------- | ----- | ---------------------------------------------------------------------------- |
| ELYSIA.md     | ~500  | Elysia routes, lifecycle, error handling, plugins, DI, guards, service layer |
| VALIDATION.md | ~140  | TypeBox schemas, validation targets, layers, placement rules                 |
| DRIZZLE.md    | ~495  | Drizzle schema, CRUD queries, relations, transactions, connection            |
| WORKFLOW.md   | ~340  | TDD flow, targeted checks, DB snapshots, seeding, new model checklist, JSDoc |
| TESTING.md    | ~500  | TDD workflow, test context, fixtures, traits, route testing                  |

---

## External Documentation

**Elysia:**

- [Route Composition](https://elysiajs.com/essential/route)
- [Validation](https://elysiajs.com/essential/validation)
- [Lifecycle](https://elysiajs.com/essential/life-cycle)
- [Error Handling](https://elysiajs.com/patterns/error-handling)
- [Plugins](https://elysiajs.com/essential/plugin)
- [Dependency Injection](https://elysiajs.com/patterns/extends-context)
- [Best Practices](https://elysiajs.com/essential/best-practice)

**Drizzle ORM:**

- [Schema Declaration](https://orm.drizzle.team/docs/sql-schema-declaration)
- [Column Types (PG)](https://orm.drizzle.team/docs/column-types/pg)
- [Select Queries](https://orm.drizzle.team/docs/select)
- [Insert Queries](https://orm.drizzle.team/docs/insert)
- [Relations](https://orm.drizzle.team/docs/relations)
- [Transactions](https://orm.drizzle.team/docs/transactions)

**Testing:**

- [Vitest Test Context](https://vitest.dev/guide/test-context)
- [Vitest Config Reference](https://vitest.dev/config/)
- [drizzle-fixtures](https://github.com/jswob/drizzle-fixtures)
