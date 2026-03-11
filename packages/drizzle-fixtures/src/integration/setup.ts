/**
 * Integration test database setup utilities.
 *
 * Provides connection management and table lifecycle functions
 * for running integration tests against a real PostgreSQL database.
 */
import { sql } from 'drizzle-orm';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema';
import { integrationUsers, integrationPosts, roleEnum } from './schema';

// Connection configuration from environment
const DB_USER = process.env.DB_USER ?? 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD ?? 'password';
const DB_HOST = process.env.DB_HOST ?? 'localhost';
const TEST_DB_PORT = process.env.TEST_DB_PORT ?? '5433';
const TEST_DB_NAME = process.env.TEST_DB_NAME ?? 'meetings_scheduler_test_db';

const connectionString = `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${TEST_DB_PORT}/${TEST_DB_NAME}`;

// Singleton connection and db instance
let connection: postgres.Sql | null = null;
let db: PostgresJsDatabase<typeof schema> | null = null;

/**
 * Get the integration database instance.
 * Creates connection on first call, reuses on subsequent calls.
 */
export function getIntegrationDb(): PostgresJsDatabase<typeof schema> {
	if (!db) {
		connection = postgres(connectionString, {
			max: 5, // Small pool for integration tests
			idle_timeout: 60, // Close idle connections after 60s
			connect_timeout: 30, // Connection timeout
			ssl: false,
		});
		db = drizzle(connection, { schema });
	}
	return db;
}

/**
 * Wait for database to be available with retries.
 *
 * @param maxAttempts - Maximum number of connection attempts
 * @param delayMs - Delay between attempts in milliseconds
 */
export async function waitForDatabase(maxAttempts = 10, delayMs = 500): Promise<void> {
	const testDb = getIntegrationDb();

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			await testDb.execute(sql`SELECT 1`);
			return;
		} catch (error) {
			if (attempt === maxAttempts) {
				throw new Error(
					`Database not available after ${maxAttempts} attempts: ${(error as Error).message}`
				);
			}
			await new Promise(resolve => setTimeout(resolve, delayMs));
		}
	}
}

/**
 * Create integration test tables and enum.
 *
 * Creates the enum FIRST, then the tables (proper dependency order).
 */
export async function createIntegrationTables(): Promise<void> {
	const testDb = getIntegrationDb();

	// Suppress NOTICE messages during DROP operations
	await testDb.execute(sql`SET client_min_messages = warning`);

	// Drop existing tables and enum (if they exist) in reverse order
	await testDb.execute(sql`DROP TABLE IF EXISTS ${integrationPosts} CASCADE`);
	await testDb.execute(sql`DROP TABLE IF EXISTS ${integrationUsers} CASCADE`);
	await testDb.execute(sql`DROP TYPE IF EXISTS integration_role CASCADE`);

	// Restore default message level
	await testDb.execute(sql`SET client_min_messages = notice`);

	// Create enum first
	await testDb.execute(sql`
		CREATE TYPE integration_role AS ENUM ('user', 'admin', 'moderator')
	`);

	// Create users table
	await testDb.execute(sql`
		CREATE TABLE integration_users (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			name VARCHAR(255) NOT NULL,
			email VARCHAR(255) NOT NULL UNIQUE,
			role integration_role NOT NULL DEFAULT 'user',
			created_at TIMESTAMP NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMP NOT NULL DEFAULT NOW()
		)
	`);

	// Create posts table with FK
	await testDb.execute(sql`
		CREATE TABLE integration_posts (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			title VARCHAR(255) NOT NULL,
			content TEXT,
			user_id UUID NOT NULL REFERENCES integration_users(id) ON DELETE CASCADE,
			status VARCHAR(50) DEFAULT 'draft',
			created_at TIMESTAMP NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMP NOT NULL DEFAULT NOW()
		)
	`);
}

/**
 * Drop integration test tables and enum.
 *
 * Used for cleanup in afterAll.
 */
export async function dropIntegrationTables(): Promise<void> {
	const testDb = getIntegrationDb();

	// Suppress NOTICE messages during DROP operations
	await testDb.execute(sql`SET client_min_messages = warning`);

	await testDb.execute(sql`DROP TABLE IF EXISTS ${integrationPosts} CASCADE`);
	await testDb.execute(sql`DROP TABLE IF EXISTS ${integrationUsers} CASCADE`);
	await testDb.execute(sql`DROP TYPE IF EXISTS integration_role CASCADE`);

	// Restore default message level
	await testDb.execute(sql`SET client_min_messages = notice`);
}

/**
 * Truncate all integration tables.
 *
 * Safety net for afterAll to ensure clean state even if
 * individual test rollbacks fail.
 */
export async function truncateIntegrationTables(): Promise<void> {
	const testDb = getIntegrationDb();

	// TRUNCATE with CASCADE handles FK relationships
	await testDb.execute(sql`TRUNCATE TABLE ${integrationPosts}, ${integrationUsers} CASCADE`);
}

/**
 * Close the database connection.
 *
 * Must be called in afterAll to prevent test hanging.
 */
export async function closeConnection(): Promise<void> {
	if (connection) {
		await connection.end();
		connection = null;
		db = null;
	}
}

// Re-export schema and types for convenience
export { integrationUsers, integrationPosts, roleEnum };
export type { IntegrationUser, IntegrationPost } from './schema';
