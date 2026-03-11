import { drizzle } from 'drizzle-orm/postgres-js';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema';

let connection: postgres.Sql | null = null;
let db: PostgresJsDatabase<typeof schema> | null = null;

export function getTestDb(): PostgresJsDatabase<typeof schema> {
	if (!db) {
		const connectionString = `postgres://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'password'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5433'}/${process.env.DB_NAME || 'meetings_scheduler_test_db'}`;

		connection = postgres(connectionString, {
			max: 5,
			idle_timeout: 60,
			ssl: false,
		});
		db = drizzle(connection, { schema });
	}
	return db;
}

export async function closeTestDb(): Promise<void> {
	if (connection) {
		await connection.end({ timeout: 5 });
		connection = null;
		db = null;
	}
}
