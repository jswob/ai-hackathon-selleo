import { Elysia } from 'elysia';
import { describe, it, expect } from 'vitest';

describe('API Server', () => {
	it('should respond to health check', async () => {
		const app = new Elysia().get('/health', () => ({ status: 'ok', timestamp: Date.now() }));

		const response = await app.handle(new Request('http://localhost/health'));
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toMatchObject({
			status: 'ok',
			timestamp: expect.any(Number) as number,
		});
	});

	it('should respond to root endpoint', async () => {
		const app = new Elysia().get('/', () => 'API Server Running!');

		const response = await app.handle(new Request('http://localhost/'));
		const text = await response.text();

		expect(response.status).toBe(200);
		expect(text).toBe('API Server Running!');
	});
});
