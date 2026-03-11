import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	dialect: 'postgresql',
	schema: './src/db/schema/*.ts',
	out: './drizzle',
	dbCredentials: {
		host: process.env.DB_HOST || 'localhost',
		port: parseInt(process.env.DB_PORT || '5432'),
		user: process.env.DB_USER || 'postgres',
		password: process.env.DB_PASSWORD || 'password',
		database: process.env.DB_NAME || 'meetings_scheduler_db',
		ssl: false,
	},
});
