import { Elysia } from 'elysia';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { createRoastBattleRoute } from './index';

vi.mock('ai', () => ({
	streamText: vi.fn(),
}));

vi.mock('@ai-sdk/google', () => ({
	google: vi.fn(() => 'mock-model'),
}));

import { streamText } from 'ai';
import { buildRoastSystemPrompt, buildJudgeSystemPrompt } from './prompts';

const mockStreamText = vi.mocked(streamText);

function createTestApp() {
	return new Elysia().use(createRoastBattleRoute());
}

function mockStreamResponse(text: string) {
	const stream = new ReadableStream({
		start(controller) {
			controller.enqueue(new TextEncoder().encode(text));
			controller.close();
		},
	});

	mockStreamText.mockReturnValue({
		toTextStreamResponse: () =>
			new Response(stream, {
				headers: { 'Content-Type': 'text/plain; charset=utf-8' },
			}),
	} as any);
}

describe('POST /roast-battle/roast', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test('returns streaming response', async () => {
		mockStreamResponse('You call that a roast?');
		const app = createTestApp();

		const response = await app.handle(
			new Request('http://localhost/roast-battle/roast', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					topic: 'pineapple pizza',
					messages: [{ role: 'user', content: 'Your turn!' }],
				}),
			})
		);

		expect(response.status).toBe(200);
		const text = await response.text();
		expect(text).toBe('You call that a roast?');
	});

	test('validates body — missing topic', async () => {
		const app = createTestApp();

		const response = await app.handle(
			new Request('http://localhost/roast-battle/roast', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					messages: [{ role: 'user', content: 'Hey' }],
				}),
			})
		);

		expect(response.status).toBe(422);
	});

	test('validates body — missing messages', async () => {
		const app = createTestApp();

		const response = await app.handle(
			new Request('http://localhost/roast-battle/roast', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ topic: 'cats' }),
			})
		);

		expect(response.status).toBe(422);
	});

	test('passes correct system prompt with topic', async () => {
		mockStreamResponse('roast text');
		const app = createTestApp();

		await app.handle(
			new Request('http://localhost/roast-battle/roast', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					topic: 'cats',
					messages: [{ role: 'user', content: 'Go!' }],
				}),
			})
		);

		expect(mockStreamText).toHaveBeenCalledWith(
			expect.objectContaining({
				system: buildRoastSystemPrompt('cats'),
			})
		);
	});

	test('maps messages to user/assistant roles', async () => {
		mockStreamResponse('roast');
		const app = createTestApp();

		const messages = [
			{ role: 'user', content: 'First roast' },
			{ role: 'assistant', content: 'Counter roast' },
			{ role: 'user', content: 'Another one' },
		];

		await app.handle(
			new Request('http://localhost/roast-battle/roast', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ topic: 'dogs', messages }),
			})
		);

		expect(mockStreamText).toHaveBeenCalledWith(
			expect.objectContaining({
				messages: [
					{ role: 'user', content: 'First roast' },
					{ role: 'assistant', content: 'Counter roast' },
					{ role: 'user', content: 'Another one' },
				],
			})
		);
	});
});

describe('POST /roast-battle/judge', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test('returns streaming response', async () => {
		mockStreamResponse('WINNER: Player\nVERDICT: Brilliant roasts!');
		const app = createTestApp();

		const response = await app.handle(
			new Request('http://localhost/roast-battle/judge', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					topic: 'pizza',
					transcript: 'Player: roast1\nAI: roast2',
				}),
			})
		);

		expect(response.status).toBe(200);
		const text = await response.text();
		expect(text).toContain('WINNER: Player');
	});

	test('validates body — missing transcript', async () => {
		const app = createTestApp();

		const response = await app.handle(
			new Request('http://localhost/roast-battle/judge', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ topic: 'pizza' }),
			})
		);

		expect(response.status).toBe(422);
	});

	test('passes transcript in prompt', async () => {
		mockStreamResponse('WINNER: AI\nVERDICT: AI was funnier');
		const app = createTestApp();
		const transcript = 'Player: weak\nAI: devastating';

		await app.handle(
			new Request('http://localhost/roast-battle/judge', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ topic: 'coding', transcript }),
			})
		);

		expect(mockStreamText).toHaveBeenCalledWith(
			expect.objectContaining({
				system: buildJudgeSystemPrompt('coding', transcript),
			})
		);
	});
});
