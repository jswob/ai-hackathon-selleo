import { join } from 'path';
import { wrap } from '@bogeychan/elysia-logger';
import { cors } from '@elysiajs/cors';
import { Elysia } from 'elysia';
import { logger } from './utils/logger';

// Load environment variables from project root
async function loadEnvFromRoot() {
	try {
		const envPath = join(import.meta.dir, '../../../.env');
		const envFile = Bun.file(envPath);

		if (await envFile.exists()) {
			const envContent = await envFile.text();
			envContent.split('\n').forEach(line => {
				const trimmedLine = line.trim();
				if (trimmedLine && !trimmedLine.startsWith('#')) {
					const [key, ...valueParts] = trimmedLine.split('=');
					if (key && valueParts.length > 0) {
						const value = valueParts.join('=').trim();
						if (!process.env[key.trim()]) {
							process.env[key.trim()] = value;
						}
					}
				}
			});
		}
	} catch (error) {
		logger.warn({ error }, 'Could not load .env from root');
	}
}

// Load env before setting up the server
await loadEnvFromRoot();

const port = parseInt(process.env.API_PORT || '3001');

const app = new Elysia()
	.use(wrap(logger))
	.use(cors())
	.get('/', () => 'API Server Running!')
	.get('/health', () => ({ status: 'ok', timestamp: Date.now() }));

export type App = typeof app;

export default {
	port,
	fetch: app.fetch,
};

if (!process.env.BUN_HOT_RELOAD) {
	app.listen(port);
	logger.info(`🦊 Elysia is running at http://localhost:${port}`);
}
