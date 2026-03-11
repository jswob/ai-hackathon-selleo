import { join } from 'path';
import { loadEnv } from 'vite';
import { afterAll } from 'vitest';
import { closeTestDb } from './src/test/db';

const rootDir = join(__dirname, '../..');
const env = loadEnv('test', rootDir, '');
Object.assign(process.env, env);

process.env.DB_PORT = process.env.TEST_DB_PORT || '5433';
process.env.DB_NAME = process.env.TEST_DB_NAME || 'meetings_scheduler_test_db';

afterAll(async () => {
	await closeTestDb();
});
