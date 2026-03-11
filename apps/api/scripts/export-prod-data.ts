#!/usr/bin/env bun

import { execSync } from 'child_process';
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';

const CONTAINER = 'ms-prod-postgres';
const DB_USER = process.env.DB_USER ?? 'postgres';
const DB_NAME = process.env.DB_NAME ?? 'meetings_scheduler_prod';

const SEED_DATA_DIR = join(dirname(import.meta.dir), 'src', 'db', 'seed-data', `${Date.now()}`);

// Tables in FK-dependency order (excludes solve_jobs)
const TABLES = [
	'participants',
	'trait_definitions',
	'participant_traits',
	'role_types',
	'role_type_eligibility',
	'task_types',
	'task_type_roles',
	'meetings',
	'tasks',
	'roles',
	'rules',
	'rule_requirements',
	'rule_conditions',
	'assignments',
	'participant_availability_exclusions',
] as const;

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

function queryTable(table: string): Record<string, unknown>[] {
	const sql = `SELECT row_to_json(t) FROM (SELECT * FROM ${table}) t`;
	const cmd = `docker exec ${CONTAINER} psql -U ${DB_USER} -d ${DB_NAME} -t -A -c "${sql}"`;

	try {
		const output = execSync(cmd, { encoding: 'utf8' }).trim();
		if (!output) return [];

		return output
			.split('\n')
			.filter(line => line.trim().length > 0)
			.map(line => JSON.parse(line) as Record<string, unknown>);
	} catch (error) {
		console.error(`Failed to query table ${table}:`, error);
		process.exit(1);
	}
}

// ── Main ──────────────────────────────────────────────────────────────

console.log('Exporting production data...\n');
ensureContainerRunning();

mkdirSync(SEED_DATA_DIR, { recursive: true });

let totalRecords = 0;

for (const table of TABLES) {
	const rows = queryTable(table);
	const filePath = join(SEED_DATA_DIR, `${table}.json`);
	writeFileSync(filePath, `${JSON.stringify(rows, null, 2)}\n`);
	console.log(`  ${table}: ${rows.length} records`);
	totalRecords += rows.length;
}

const snapshotName = SEED_DATA_DIR.split('/').pop();
console.log(
	`\nDone! Exported ${totalRecords} records across ${TABLES.length} tables to snapshot ${snapshotName}`
);
