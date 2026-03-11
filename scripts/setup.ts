import { existsSync, copyFileSync } from 'fs';
import { resolve } from 'path';

const root = resolve(import.meta.dirname, '..');
const envPath = resolve(root, '.env');
const envExamplePath = resolve(root, '.env.example');

if (existsSync(envPath)) {
	console.log('✓ .env already exists, skipping copy.');
} else {
	copyFileSync(envExamplePath, envPath);
	console.log('✓ Created .env from .env.example');
}

console.log(`
──────────────────────────────────
  Getting Started
──────────────────────────────────

  1. Start the database:     bun db:up
  2. Run migrations:         bun db:migrate
  3. Start development:      bun dev

  Web  → http://localhost:5173
  API  → http://localhost:3001

  See README.md for more commands.
──────────────────────────────────
`);
