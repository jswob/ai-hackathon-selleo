#!/usr/bin/env bun
/**
 * E2E Database Setup Script
 *
 * This script prepares the E2E database environment:
 * 1. Drop and recreate the E2E database (clean slate)
 * 2. Run migrations (apply committed schema changes)
 * 3. Run push (apply uncommitted schema changes)
 * 4. Run seed (populate with test data)
 * 5. Create baseline snapshot for fast restoration
 */
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

const ENV_FILE = join(process.cwd(), '../../.env');
const E2E_CONTAINER = `${process.env.COMPOSE_PROJECT_NAME || 'meetings-scheduler'}-postgres-e2e`;
const E2E_VOLUME = `${process.env.COMPOSE_PROJECT_NAME || 'meetings-scheduler'}_postgres_e2e_data`;
const E2E_BASELINE_VOLUME = 'e2e_snapshot_base';

function loadEnv(): void {
	try {
		const envContent = readFileSync(ENV_FILE, 'utf8');
		envContent.split('\n').forEach(line => {
			const [key, value] = line.split('=');
			if (key && value && !key.startsWith('#')) {
				process.env[key.trim()] = value.trim();
			}
		});
	} catch {
		console.warn('Warning: Could not load .env file');
	}
}

function executeCommand(
	command: string,
	description: string,
	options?: { stdio?: 'pipe' | 'inherit' }
): string {
	try {
		const result = execSync(command, {
			encoding: 'utf8',
			stdio: options?.stdio || 'pipe',
			cwd: process.cwd(),
		});
		return result?.trim() || '';
	} catch (error) {
		console.error(`❌ Failed to ${description}:`, error);
		process.exit(1);
	}
}

function checkE2EContainer(): void {
	const e2ePort = process.env.E2E_DB_PORT || '5434';
	console.log(`🔍 Checking E2E database on port ${e2ePort}...`);

	try {
		execSync(`docker ps --filter "publish=${e2ePort}" --format "{{.Names}}" | grep -q .`, {
			stdio: 'pipe',
		});
		console.log('✅ E2E database container is running');
	} catch {
		console.error(
			'❌ E2E database is not running. Please run "docker compose up -d postgres-e2e" first.'
		);
		process.exit(1);
	}
}

function createE2EDatabase(): void {
	const dbName = process.env.E2E_DB_NAME || 'meetings_scheduler_e2e_db';
	console.log(`🗄️ Creating fresh E2E database (${dbName})...`);

	try {
		execSync(
			`docker exec ${E2E_CONTAINER} psql -U postgres -c "DROP DATABASE IF EXISTS ${dbName};" && ` +
				`docker exec ${E2E_CONTAINER} psql -U postgres -c "CREATE DATABASE ${dbName};"`,
			{ stdio: 'pipe' }
		);
		console.log('✅ E2E database created');
	} catch {
		console.error('❌ Failed to create E2E database');
		process.exit(1);
	}
}

function runMigrations(): void {
	const dbName = process.env.E2E_DB_NAME || 'meetings_scheduler_e2e_db';
	const dbPort = process.env.E2E_DB_PORT || '5434';

	console.log('📦 Running migrations on E2E database...');

	try {
		execSync(`DB_NAME=${dbName} DB_PORT=${dbPort} bun src/db/migrate.ts`, {
			stdio: 'inherit',
			cwd: process.cwd(),
			env: { ...process.env, DB_NAME: dbName, DB_PORT: dbPort },
		});
		console.log('✅ Migrations completed');
	} catch {
		console.error('❌ Failed to run migrations');
		process.exit(1);
	}
}

function runPush(): void {
	console.log('🔍 Checking and applying schema changes...');

	try {
		execSync('bun drizzle-kit push --force --config=drizzle.config.e2e.ts', {
			stdio: 'inherit',
			cwd: process.cwd(),
		});
		console.log('✅ Schema push completed');
	} catch {
		console.error('❌ Failed to push schema changes');
		process.exit(1);
	}
}

function runSeed(): void {
	const dbName = process.env.E2E_DB_NAME || 'meetings_scheduler_e2e_db';
	const dbPort = process.env.E2E_DB_PORT || '5434';

	console.log('🌱 Seeding E2E database...');

	try {
		execSync(`DB_NAME=${dbName} DB_PORT=${dbPort} bun src/db/seed.ts`, {
			stdio: 'inherit',
			cwd: process.cwd(),
			env: { ...process.env, DB_NAME: dbName, DB_PORT: dbPort },
		});
		console.log('✅ Seeding completed');
	} catch {
		console.error('❌ Failed to seed database');
		process.exit(1);
	}
}

function stopE2EContainer(): void {
	console.log('🛑 Stopping E2E PostgreSQL container...');
	executeCommand(`docker stop ${E2E_CONTAINER}`, 'stop E2E PostgreSQL');
}

function startE2EContainer(): void {
	console.log('🚀 Starting E2E PostgreSQL container...');
	executeCommand(`docker start ${E2E_CONTAINER}`, 'start E2E PostgreSQL');
}

function createBaselineSnapshot(): void {
	console.log('📸 Creating E2E baseline snapshot...');

	stopE2EContainer();

	try {
		// Remove existing baseline if exists
		const volumes = executeCommand('docker volume ls --format "{{.Name}}"', 'list volumes');
		if (volumes.split('\n').includes(E2E_BASELINE_VOLUME)) {
			executeCommand(`docker volume rm ${E2E_BASELINE_VOLUME}`, 'remove existing baseline');
			console.log('  🔄 Updating existing baseline snapshot');
		} else {
			console.log('  ✨ Creating new baseline snapshot');
		}

		// Create baseline volume
		executeCommand(
			`docker volume create ${E2E_BASELINE_VOLUME}`,
			`create volume ${E2E_BASELINE_VOLUME}`
		);

		// Copy data from E2E volume to baseline
		const copyCommand = `docker run --rm -v ${E2E_VOLUME}:/source:ro -v ${E2E_BASELINE_VOLUME}:/target alpine sh -c "cp -a /source/. /target/"`;
		executeCommand(copyCommand, `copy data to ${E2E_BASELINE_VOLUME}`);

		console.log('✅ Baseline snapshot created');
		console.log('🔒 Baseline snapshot will be used for fast test restoration');
	} finally {
		startE2EContainer();
	}
}

function main(): void {
	console.log('🧪 Setting up E2E database...\n');

	loadEnv();
	checkE2EContainer();

	createE2EDatabase();
	runMigrations();
	runPush();
	runSeed();
	createBaselineSnapshot();

	console.log('\n🎉 E2E database setup complete!');
	console.log('💡 Run "bun e2e" to execute E2E tests');
}

try {
	main();
} catch (error) {
	console.error('Setup failed:', error);
	process.exit(1);
}
