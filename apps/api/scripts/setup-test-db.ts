#!/usr/bin/env bun
/**
 * Test Database Setup Script
 *
 * This script implements a comprehensive approach for test database management:
 * 1. Drop and recreate database (clean slate)
 * 2. Run migrations (apply committed schema changes)
 * 3. Run push --strict (automatically detects and applies uncommitted changes)
 *
 * Benefits:
 * - Production-like migration testing
 * - Uses official Drizzle --strict flag for change detection
 * - Automatic handling of "no changes" scenarios
 * - Robust: always starts from known clean state
 */
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

const ENV_FILE = join(process.cwd(), '../../.env');

function loadEnv() {
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

function checkTestDatabase() {
	const testPort = process.env.TEST_DB_PORT || '5433';

	console.log(`🔍 Checking test database on port ${testPort}...`);

	try {
		execSync(`docker ps --filter "publish=${testPort}" --format "{{.Names}}" | grep -q .`, {
			stdio: 'pipe',
		});
		console.log('✅ Test database container is running');
	} catch {
		console.error('❌ Test database is not running. Please run "bun db:up" first.');
		process.exit(1);
	}
}

function createDatabase() {
	console.log('🗄️ Creating fresh test database...');

	try {
		execSync(
			`docker exec ${process.env.COMPOSE_PROJECT_NAME || 'meetings-scheduler'}-postgres-test psql -U postgres -c "DROP DATABASE IF EXISTS meetings_scheduler_test_db;" && docker exec ${process.env.COMPOSE_PROJECT_NAME || 'meetings-scheduler'}-postgres-test psql -U postgres -c "CREATE DATABASE meetings_scheduler_test_db;"`,
			{
				stdio: 'pipe',
			}
		);
		console.log('✅ Test database created');
	} catch {
		console.error('❌ Failed to create test database');
		process.exit(1);
	}
}

function runMigrations() {
	console.log('📦 Running migrations (committed schema)...');

	try {
		const testPort = process.env.TEST_DB_PORT || '5433';
		execSync(`DB_NAME=meetings_scheduler_test_db DB_PORT=${testPort} bun src/db/migrate.ts`, {
			stdio: 'inherit',
			cwd: process.cwd(),
			env: { ...process.env, DB_NAME: 'meetings_scheduler_test_db', DB_PORT: testPort },
		});
		console.log('✅ Migrations completed');
	} catch {
		console.error('❌ Failed to run migrations');
		process.exit(1);
	}
}

function runPushIfNeeded() {
	console.log('🔍 Checking and applying schema changes...');

	try {
		execSync('bun drizzle-kit push --force --config=drizzle.config.test.ts', {
			stdio: 'inherit',
			cwd: process.cwd(),
		});
		console.log('✅ Schema push completed');
	} catch {
		console.error('❌ Failed to push schema changes');
		process.exit(1);
	}
}

function setupSchema() {
	console.log('📦 Setting up test database schema...');

	try {
		createDatabase();
		runMigrations();
		runPushIfNeeded();

		console.log('✅ Test database schema setup complete');
	} catch {
		console.error('❌ Failed to setup test database schema');
		process.exit(1);
	}
}

function main() {
	console.log('🧪 Setting up test database...');

	loadEnv();
	checkTestDatabase();
	setupSchema();

	console.log('🎉 Test database setup complete!');
}

try {
	main();
} catch (error) {
	console.error('Setup failed:', error);
	process.exit(1);
}
