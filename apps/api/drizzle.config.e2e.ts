import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	dialect: 'postgresql',
	schema: './src/db/schema/*.ts',
	out: './drizzle',
	dbCredentials: {
		host: process.env.DB_HOST || 'localhost',
		port: parseInt(process.env.E2E_DB_PORT || '5434'),
		user: process.env.DB_USER || 'postgres',
		password: process.env.DB_PASSWORD || 'password',
		database: process.env.E2E_DB_NAME || 'meetings_scheduler_e2e_db',
		ssl: false,
	},
});
