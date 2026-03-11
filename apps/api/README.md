# API

Elysia API server with PostgreSQL (Drizzle ORM). Serves the React frontend via Eden Treaty type-safe HTTP client.

---

## Architecture

The API is organized around domain modules. Each module encapsulates its routes, business logic, and tests.

```
src/
├── index.ts            # App entry: compose modules via .use(), export App type
├── db/
│   ├── connection.ts   # PostgreSQL client + Drizzle instance
│   ├── schema/         # Table definitions (one file per table)
│   ├── migrate.ts      # Migration runner
│   └── types.ts        # DatabaseConnection type
├── modules/            # Domain modules (one directory per entity)
├── test/
│   ├── test-context.ts # Vitest context with auto-rollback tx + factory
│   └── fixtures/       # One fixture file per table
└── utils/
    ├── db-errors.ts    # DB error detection
    ├── logger.ts       # Pino logger
    ├── schemas.ts      # Shared TypeBox validation schemas
    └── service-result.ts # ServiceResult discriminated union
```

---

## Adding a New Domain Module

### 1. Define the schema

```typescript
// src/db/schema/users.ts
import { pgTable, text } from 'drizzle-orm/pg-core';
import { timestamps, uuidPrimaryKey } from './common';

export const users = pgTable('users', {
	id: uuidPrimaryKey,
	name: text('name').notNull(),
	...timestamps,
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

Re-export from `schema/index.ts`:

```typescript
export * from './users';
```

### 2. Create the route module

```typescript
// src/modules/users/index.ts
import { Elysia } from 'elysia';
import type { DatabaseConnection } from '@/db/types';

export function createUsersRoute(db: DatabaseConnection) {
	return new Elysia({ prefix: '/users' }).get('/', async () => {
		return db.select().from(users);
	});
}
```

### 3. Register in index.ts

```typescript
import { createUsersRoute } from './modules/users';
// ...
const app = new Elysia().use(createUsersRoute(db));
// ...
```

### 4. Create a fixture

```typescript
// src/test/fixtures/users.ts
import { createFixture } from '@meetings-scheduler/drizzle-fixtures';
import { users } from '../db/schema';

export const userFixture = createFixture({
	table: users,
	fields: { name: () => 'Test User' },
});
```

---

## Testing

Tests use an auto-rollback transaction so each test runs in isolation:

```typescript
import { test, expect, describe } from '../test/test-context';

describe('GET /users', () => {
	test('returns list of users', async ({ tx, factory }) => {
		await factory.user();
		const app = createUsersRoute(tx);
		const res = await app.handle(new Request('http://localhost/users'));
		expect(res.status).toBe(200);
	});
});
```

---

## Database Commands

| Command            | Description                                |
| ------------------ | ------------------------------------------ |
| `bun db:up`        | Start PostgreSQL                           |
| `bun db:push:safe` | Push schema changes (auto-snapshots first) |
| `bun db:generate`  | Generate migration SQL (**USER ONLY**)     |
| `bun db:migrate`   | Run pending migrations                     |
| `bun db:seed`      | Seed database                              |
| `bun db:undo`      | Revert last push                           |
| `bun db:reset`     | Restore to baseline snapshot               |

See root `CLAUDE.md` for full database workflow.
