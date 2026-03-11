# Drizzle ORM - API Reference

API reference for Drizzle ORM schema definition, queries, and database operations in TypeScript/PostgreSQL.

**When to Use:** Defining database schemas, writing CRUD queries, setting up relations, managing transactions, configuring database connections, exporting types for API validation.

**Prerequisite:** `import { pgTable, integer, varchar, ... } from 'drizzle-orm/pg-core'` for schema; `import { eq, and, ... } from 'drizzle-orm'` for query operators.

## Table of Contents

- [Schema Definition](#schema-definition)
- [Common Columns Pattern](#common-columns-pattern)
- [Type Exports](#type-exports)
- [Select Queries](#select-queries)
- [Insert Queries](#insert-queries)
- [Update Queries](#update-queries)
- [Delete Queries](#delete-queries)
- [Relational Queries](#relational-queries)
- [Transactions](#transactions)
- [Database Connection](#database-connection)
- [Deep Dive](#deep-dive)

---

## Schema Definition

**Key Concepts:**

- `pgTable(name, columns, constraints?)` — define a PostgreSQL table with typed columns
- `.primaryKey()`, `.notNull()`, `.unique()`, `.default()` — column constraint methods
- `.references(() => table.column)` — inline foreign key with `onDelete`/`onUpdate` actions
- `.generatedAlwaysAsIdentity()` — preferred primary key strategy over `serial()`
- Third parameter array for indexes and composite constraints

```typescript
import { pgTable, integer, varchar, timestamp, index } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull().unique(),
	createdAt: timestamp().defaultNow().notNull(),
});

export const posts = pgTable(
	'posts',
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		title: varchar({ length: 255 }).notNull(),
		authorId: integer()
			.references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' })
			.notNull(),
	},
	table => [index('posts_author_idx').on(table.authorId)]
);
```

**Column constraints:**

- **Primary Key:** `.primaryKey()` or composite via `primaryKey({ columns: [...] })`
- **Not Null:** `.notNull()`
- **Unique:** `.unique()`
- **Default:** `.default('value')` or `.defaultNow()` for timestamps
- **Foreign Key:** `.references(() => table.col, { onDelete, onUpdate })`
- **FK actions:** `'cascade' | 'restrict' | 'no action' | 'set null' | 'set default'`

**Enums:** `pgEnum('status', ['active', 'inactive'])` creates a PostgreSQL enum; use as column type: `statusEnum().default('active')`.

**Casing:** Enable automatic camelCase-to-snake_case conversion in [Database Connection](#database-connection).

**Schema organization:** Single file (`src/db/schema.ts`) or folder (`src/db/schema/`) — Drizzle recursively discovers all exports from either layout.

> **Caveat:** Prefer `generatedAlwaysAsIdentity()` over `serial()` for primary keys. Identity columns are the SQL-standard approach and give explicit control over sequence behavior. `serial()` is a legacy PostgreSQL shorthand.

---

## Common Columns Pattern

**Key Concepts:**

- Spread reusable column objects into `pgTable` definitions for DRY schemas
- Extract common patterns like timestamps, soft-delete, and identity PK into shared objects

```typescript
import { pgTable, integer, varchar, timestamp } from 'drizzle-orm/pg-core';

const withId = {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
};
const timestamps = {
	createdAt: timestamp().defaultNow().notNull(),
	updatedAt: timestamp(),
	deletedAt: timestamp(),
};

export const users = pgTable('users', {
	...withId,
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull().unique(),
	...timestamps,
});
export const posts = pgTable('posts', {
	...withId,
	title: varchar({ length: 255 }).notNull(),
	...timestamps,
});
```

---

## Type Exports

**Key Concepts:**

- `table.$inferSelect` — extract the SELECT result type (all columns, nullability applied)
- `table.$inferInsert` — extract the INSERT input type (defaults and auto-generated columns optional)
- `column.$type<T>()` — brand a column with a custom TypeScript type
- Export inferred types alongside table definitions for use in route handlers and services

```typescript
import { pgTable, integer, varchar, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	name: varchar({ length: 255 }).notNull(),
	metadata: jsonb().$type<{ role: string; active: boolean }>(),
});

// Inferred types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

**Barrel export pattern** — re-export types from schema index:

```typescript
// src/db/schema/index.ts
export { users, type User, type NewUser } from './users';
export { posts, type Post, type NewPost } from './posts';
```

> **Caveat:** Use `$inferInsert` (not `$inferSelect`) for request body types. `$inferSelect` includes auto-generated fields like `id` and `createdAt` as required, which don't belong in insert payloads.

---

## Select Queries

**Key Concepts:**

- `db.select().from(table)` — select all columns; pass object for partial select
- Filter operators (`eq`, `and`, `or`, etc.) imported from `'drizzle-orm'`
- `.orderBy()`, `.limit()`, `.offset()` for pagination
- `.innerJoin()`, `.leftJoin()` for joining tables
- `db.$count(table, filter?)` — shorthand for counting rows

```typescript
import { eq, ne, gt, gte, lt, lte, and, or, not } from 'drizzle-orm';
import { asc, desc } from 'drizzle-orm';

// All columns
const allUsers = await db.select().from(users);

// Partial select
const names = await db.select({ id: users.id, name: users.name }).from(users);

// WHERE with comparison
await db.select().from(users).where(eq(users.id, 42));

// Logical operators
await db
	.select()
	.from(users)
	.where(and(eq(users.name, 'Dan'), gt(users.age, 18)));
await db
	.select()
	.from(users)
	.where(or(eq(users.role, 'admin'), eq(users.role, 'editor')));
```

**Pattern and range operators:**

| Operator    | Example                        | Description                    |
| ----------- | ------------------------------ | ------------------------------ |
| `like`      | `like(users.name, '%Dan%')`    | Case-sensitive pattern match   |
| `ilike`     | `ilike(users.name, '%dan%')`   | Case-insensitive pattern match |
| `between`   | `between(users.age, 18, 65)`   | Range check (inclusive)        |
| `inArray`   | `inArray(users.id, [1, 2, 3])` | Membership check               |
| `isNull`    | `isNull(users.deletedAt)`      | NULL check                     |
| `isNotNull` | `isNotNull(users.email)`       | NOT NULL check                 |

```typescript
// Ordering, limit, offset
await db.select().from(users).orderBy(asc(users.name)).limit(10).offset(20);

// Joins
await db.select().from(users).innerJoin(posts, eq(posts.authorId, users.id));
await db.select().from(users).leftJoin(posts, eq(posts.authorId, users.id));

// Count shorthand
const total = await db.$count(users);
const active = await db.$count(users, eq(users.status, 'active'));
```

> **Caveat:** All query operators (`eq`, `and`, `or`, `asc`, `desc`, etc.) are imported from `'drizzle-orm'`, not `'drizzle-orm/pg-core'`. Only column types and `pgTable` come from `pg-core`.

---

## Insert Queries

**Key Concepts:**

- `db.insert(table).values(data)` — insert one or many rows
- `.returning()` — return inserted rows (all columns or specific)
- `.onConflictDoNothing()` — skip on constraint violation
- `.onConflictDoUpdate({ target, set })` — upsert pattern

```typescript
// Single insert
await db.insert(users).values({ name: 'Dan', email: 'dan@example.com' });

// Multiple rows
await db.insert(users).values([
	{ name: 'Dan', email: 'dan@example.com' },
	{ name: 'Andrew', email: 'andrew@example.com' },
]);

// Return inserted rows
const [newUser] = await db
	.insert(users)
	.values({ name: 'Dan', email: 'dan@example.com' })
	.returning();

// Return specific columns
const [{ id }] = await db
	.insert(users)
	.values({ name: 'Dan', email: 'dan@example.com' })
	.returning({ id: users.id });
```

**Conflict handling:**

```typescript
// Skip on conflict
await db.insert(users).values({ id: 1, name: 'Dan' }).onConflictDoNothing();

// Upsert — update on conflict
await db
	.insert(users)
	.values({ id: 1, name: 'Dan', email: 'dan@example.com' })
	.onConflictDoUpdate({
		target: users.email,
		set: { name: 'Dan Updated' },
	});
```

> **Caveat:** Always chain `.returning()` when inserting in PostgreSQL. Without it, the query returns nothing — you won't get auto-generated fields like `id` or `createdAt` back.

---

## Update Queries

**Key Concepts:**

- `db.update(table).set(values).where(filter)` — update matching rows
- `sql` template tag for SQL expressions in `.set()`
- `.returning()` — return updated rows

```typescript
import { eq, sql } from 'drizzle-orm';

// Basic update
await db.update(users).set({ name: 'Mr. Dan' }).where(eq(users.name, 'Dan'));

// SQL expressions in set
await db
	.update(users)
	.set({ updatedAt: sql`NOW()` })
	.where(eq(users.id, 42));

// Update with returning
const [updated] = await db
	.update(users)
	.set({ name: 'Mr. Dan' })
	.where(eq(users.name, 'Dan'))
	.returning();

// Return specific columns
const [{ id }] = await db
	.update(users)
	.set({ name: 'Mr. Dan' })
	.where(eq(users.name, 'Dan'))
	.returning({ id: users.id });
```

> **Caveat:** Undefined values in `.set()` are silently ignored — the column is left unchanged. To explicitly set a column to NULL, pass `null`. This is intentional but can mask bugs if you accidentally pass `undefined` expecting it to clear a value.

---

## Delete Queries

**Key Concepts:**

- `db.delete(table)` — delete all rows; chain `.where()` to filter
- `.returning()` — return deleted rows (specific columns recommended)

```typescript
import { eq } from 'drizzle-orm';

// Delete all rows
await db.delete(users);

// Delete with filter
await db.delete(users).where(eq(users.name, 'Dan'));

// Return specific columns from deleted rows
const deleted = await db
	.delete(users)
	.where(eq(users.name, 'Dan'))
	.returning({ id: users.id, name: users.name });
```

---

## Relational Queries

**Key Concepts:**

- `relations(table, callback)` — define app-level relationships (not DB constraints)
- `one()` for belongs-to/has-one; `many()` for has-many
- `db.query.table.findMany({ with: { relation: true } })` — eager-load relations
- Both FK sides must define their relation for `db.query` to work
- Schema must be passed to `drizzle()` to enable `db.query`

```typescript
import { relations } from 'drizzle-orm';
import { pgTable, integer, varchar, text } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	name: varchar({ length: 255 }).notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
	posts: many(posts),
}));

export const posts = pgTable('posts', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	content: text().notNull(),
	authorId: integer().notNull(),
});

export const postsRelations = relations(posts, ({ one }) => ({
	author: one(users, {
		fields: [posts.authorId],
		references: [users.id],
	}),
}));
```

**Using db.query:**

```typescript
// Requires: const db = drizzle({ ..., schema })
const usersWithPosts = await db.query.users.findMany({
	with: { posts: true },
});
// [{ id: 1, name: "Dan", posts: [{ id: 1, content: "...", authorId: 1 }] }]
```

**Foreign Keys vs Relations:**

| Aspect       | Foreign Keys            | Relations                      |
| ------------ | ----------------------- | ------------------------------ |
| Level        | Database (DDL)          | Application (JS/TS)            |
| Enforcement  | DB enforces constraints | No constraint enforcement      |
| Purpose      | Data integrity          | Query convenience (`db.query`) |
| Independence | Works without relations | Works without foreign keys     |

> **Caveat:** Relations are app-level only — they do NOT create database constraints. Define foreign keys separately on columns via `.references()` if you need DB-enforced integrity.

> **Caveat:** `db.query` silently returns empty results if you forget to pass `{ schema }` to `drizzle()`. Always verify schema injection when relational queries return no data. See [Database Connection](#database-connection).

---

## Transactions

**Key Concepts:**

- `db.transaction(async (tx) => { ... })` — execute queries atomically
- `tx.rollback()` — explicit conditional rollback
- Throwing inside the callback automatically rolls back the transaction
- Transactions can return values
- PostgreSQL supports isolation level, access mode, and deferrable config

```typescript
import { eq, sql } from 'drizzle-orm';

// Basic transaction
await db.transaction(async tx => {
	await tx
		.update(accounts)
		.set({ balance: sql`${accounts.balance} - 100` })
		.where(eq(accounts.id, 1));
	await tx
		.update(accounts)
		.set({ balance: sql`${accounts.balance} + 100` })
		.where(eq(accounts.id, 2));
});

// Explicit conditional rollback
await db.transaction(async tx => {
	const [account] = await tx
		.select({ balance: accounts.balance })
		.from(accounts)
		.where(eq(accounts.id, 1));
	if (account.balance < 100) tx.rollback();
	await tx
		.update(accounts)
		.set({ balance: sql`${accounts.balance} - 100` })
		.where(eq(accounts.id, 1));
});

// Return values
const newBalance = await db.transaction(async tx => {
	await tx
		.update(accounts)
		.set({ balance: sql`${accounts.balance} - 100` })
		.where(eq(accounts.id, 1));
	const [account] = await tx
		.select({ balance: accounts.balance })
		.from(accounts)
		.where(eq(accounts.id, 1));
	return account.balance;
});
```

**PostgreSQL transaction config:** Pass a second argument to `db.transaction()` with `isolationLevel` (`'read committed'`, `'repeatable read'`, `'serializable'`), `accessMode` (`'read only'`, `'read write'`), and `deferrable` (boolean).

**Error handling — auto-rollback:**

```typescript
try {
	await db.transaction(async tx => {
		await tx.insert(users).values({ name: 'Dan' });
		throw new Error('Something went wrong');
		// Transaction automatically rolled back
	});
} catch (e) {
	// Handle error — insert was rolled back
}
```

> **Caveat:** Throwing any error inside a transaction callback automatically triggers a rollback. Use `tx.rollback()` only for conditional rollback where you want to abort without an error bubbling up. Both approaches are valid — choose based on control flow needs.

---

## Database Connection

**Key Concepts:**

- `drizzle({ connection, schema?, casing? })` — create database instance
- Pass `schema` to enable `db.query` relational API (see [Relational Queries](#relational-queries))
- `casing: 'snake_case'` auto-converts camelCase TS properties to snake_case DB columns
- TypeScript schema is the single source of truth. Use `db:push:safe` during development; migration files are production artifacts.
- `drizzle.config.ts` configures `drizzle-kit` CLI (schema path, output dir, dialect, credentials)

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

const db = drizzle({
	connection: process.env.DATABASE_URL!,
	schema,
	casing: 'snake_case',
});
```

**Push vs Generate:**

| Approach               | Source of Truth   | Migration Files | Use When                           |
| ---------------------- | ----------------- | --------------- | ---------------------------------- |
| `drizzle-kit push`     | TypeScript schema | None            | Dev/prototyping, rapid iteration   |
| `drizzle-kit generate` | TypeScript schema | Timestamped SQL | Production, teams, change tracking |

---

## Deep Dive

**Official Documentation:**

- [Schema Declaration](https://orm.drizzle.team/docs/sql-schema-declaration)
- [PostgreSQL Column Types](https://orm.drizzle.team/docs/column-types/pg)
- [Select Queries](https://orm.drizzle.team/docs/select)
- [Insert Queries](https://orm.drizzle.team/docs/insert)
- [Update Queries](https://orm.drizzle.team/docs/update)
- [Delete Queries](https://orm.drizzle.team/docs/delete)
- [Relations](https://orm.drizzle.team/docs/relations)
- [Transactions](https://orm.drizzle.team/docs/transactions)
- [Migrations](https://orm.drizzle.team/docs/migrations)

**Related Files:**

- SKILL.md — routing hub with decision tree, pattern index, common pitfalls
- ELYSIA.md — Elysia HTTP framework routes, lifecycle, plugins, DI, guards
- VALIDATION.md — validation reference: TypeBox API, targets, layers, rules
- TESTING.md — test context, fixtures, route testing patterns
- WORKFLOW.md — TDD flow, targeted checks, DB snapshots, seeding, new model checklist
