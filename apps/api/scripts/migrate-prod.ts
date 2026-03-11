#!/usr/bin/env bun

import { execSync } from 'child_process';
import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

const CONTAINER = 'ms-prod-postgres';
const DB_USER = process.env.DB_USER ?? 'postgres';
const DB_NAME = process.env.DB_NAME ?? 'meetings_scheduler_prod';
const DRIZZLE_DIR = join(import.meta.dir, '..', 'drizzle');

// ── Helpers ───────────────────────────────────────────────────────────

function ensureContainerRunning() {
	try {
		const status = execSync(`docker inspect -f '{{.State.Running}}' ${CONTAINER}`, {
			encoding: 'utf8',
		}).trim();
		if (status !== 'true') {
			console.error(`Container ${CONTAINER} is not running (status: ${status})`);
			process.exit(1);
		}
	} catch {
		console.error(`Container ${CONTAINER} not found. Is production running?`);
		process.exit(1);
	}
}

function execSql(sql: string): string {
	const cmd = `docker exec ${CONTAINER} psql -U ${DB_USER} -d ${DB_NAME} -t -A -c "${sql}"`;
	return execSync(cmd, { encoding: 'utf8' }).trim();
}

function execSqlViaStdin(sql: string): void {
	execSync(`docker exec -i ${CONTAINER} psql -U ${DB_USER} -d ${DB_NAME}`, {
		input: sql,
		encoding: 'utf8',
		stdio: ['pipe', 'pipe', 'pipe'],
	});
}

// ── Main ──────────────────────────────────────────────────────────────

interface JournalEntry {
	idx: number;
	version: string;
	when: number;
	tag: string;
	breakpoints: boolean;
}

console.log('Running prod migrations via docker exec...\n');
ensureContainerRunning();

// 1. Ensure migrations table exists
execSql(
	`CREATE SCHEMA IF NOT EXISTS drizzle; CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (id SERIAL PRIMARY KEY, hash TEXT NOT NULL, created_at BIGINT)`
);

// 2. Read journal
const journalPath = join(DRIZZLE_DIR, 'meta', '_journal.json');
const journal = JSON.parse(readFileSync(journalPath, 'utf8')) as {
	entries: JournalEntry[];
};

// 3. Get last applied migration timestamp
const lastCreatedAtRaw = execSql(
	'SELECT COALESCE(MAX(created_at), -1) FROM drizzle.__drizzle_migrations'
);
const lastCreatedAt = Number(lastCreatedAtRaw);

// 4. Filter pending migrations
const pending = journal.entries.filter(entry => entry.when > lastCreatedAt);

if (pending.length === 0) {
	console.log('All migrations already applied. Nothing to do.');
	process.exit(0);
}

console.log(
	`Found ${pending.length} pending migration(s) (${journal.entries.length - pending.length} already applied):\n`
);

// 5. Apply each pending migration
for (const entry of pending) {
	const sqlPath = join(DRIZZLE_DIR, `${entry.tag}.sql`);
	const sqlContent = readFileSync(sqlPath, 'utf8');

	// Split on Drizzle's statement breakpoint marker
	const statements = sqlContent
		.split('--> statement-breakpoint')
		.map(s => s.trim())
		.filter(s => s.length > 0);

	console.log(`  Applying ${entry.tag} (${statements.length} statement(s))...`);

	// Execute each statement via stdin to avoid shell escaping issues
	for (const statement of statements) {
		execSqlViaStdin(statement);
	}

	// Compute SHA-256 hash (matches Drizzle's format)
	const hash = createHash('sha256').update(sqlContent).digest('hex');

	// Record the migration
	execSql(
		`INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES ('${hash}', ${entry.when})`
	);

	console.log(`  ✓ ${entry.tag}`);
}

console.log(`\nDone! Applied ${pending.length} migration(s).`);
