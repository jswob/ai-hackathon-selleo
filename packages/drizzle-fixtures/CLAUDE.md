# Drizzle Fixtures

Type-safe database fixtures for Drizzle ORM with traits, relationships, and transaction support.

## Project Structure

```
packages/drizzle-fixtures/
├── src/
│   ├── index.ts          # Public API re-exports
│   ├── core/             # createFixture, composeFactory, resolveFields
│   ├── context/          # createUseHelper (test context integration)
│   ├── hooks/            # Lifecycle hook execution
│   ├── types/            # All TypeScript type definitions
│   └── utils/            # Error classes, table utilities
├── docs/                 # Detailed guides (api-reference, traits, hooks, context)
└── vitest.config.ts
```

## Key Exports

- **`createFixture(config)`** — defines a fixture with table, fields, traits, and hooks
- **`composeFactory(fixtures)`** — combines fixtures into a single factory object
- **`createUseHelper(options)`** — creates `use()` helper for Vitest test context integration
- **Error classes** — `FixtureError`, `TraitNotFoundError`, `FieldResolverError`, `CircularDependencyError`, `DatabaseOperationError`, `ValidationError`, `HookExecutionError`
- **Utilities** — `resolveFields`, `mergeResolvers`, `createSequenceCounter`, `getTableName`, `getPrimaryKeyColumn`

## Development Commands

All commands run from the monorepo root:

| Command                                 | Description              |
| --------------------------------------- | ------------------------ |
| `bun test:drizzle-fixtures`             | Run all tests            |
| `bun test:drizzle-fixtures:integration` | Run integration tests    |
| `bun drizzle-fixtures:typecheck`        | TypeScript type checking |

## Documentation

See `docs/` for detailed guides: `index.md` (overview), `api-reference.md`, `traits.md`, `hooks.md`, `context.md`.
