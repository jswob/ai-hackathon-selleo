# Config Package

Shared ESLint, TypeScript, and Prettier configurations for all workspace packages.

## Exports

| Export Path                                   | Description               |
| --------------------------------------------- | ------------------------- |
| `@meetings-scheduler/config/eslint/base`      | Base ESLint config        |
| `@meetings-scheduler/config/eslint/react`     | React ESLint config       |
| `@meetings-scheduler/config/eslint/node`      | Node.js ESLint config     |
| `@meetings-scheduler/config/typescript/base`  | Base TypeScript config    |
| `@meetings-scheduler/config/typescript/react` | React TypeScript config   |
| `@meetings-scheduler/config/typescript/node`  | Node.js TypeScript config |
| `@meetings-scheduler/config/prettier`         | Shared Prettier config    |

## Notes

- Config-only package — no runtime code, no scripts
- All workspace packages extend these configs via their local config files
