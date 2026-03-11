import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { Elysia, t } from 'elysia';
import { buildJudgeSystemPrompt, buildRoastSystemPrompt } from './prompts';

const MessageSchema = t.Object({
	role: t.Union([t.Literal('user'), t.Literal('assistant')]),
	content: t.String(),
});

/** Creates the roast battle route with streaming AI endpoints */
export function createRoastBattleRoute() {
	return new Elysia({ prefix: '/roast-battle' })
		.post(
			'/roast',
			async ({ body }) => {
				const result = streamText({
					model: google('gemini-2.0-flash'),
					system: buildRoastSystemPrompt(body.topic),
					messages: body.messages.map(m => ({
						role: m.role,
						content: m.content,
					})),
				});

				return result.toTextStreamResponse();
			},
			{
				body: t.Object({
					topic: t.String({ minLength: 1 }),
					messages: t.Array(MessageSchema),
				}),
			}
		)
		.post(
			'/judge',
			async ({ body }) => {
				const result = streamText({
					model: google('gemini-2.0-flash'),
					system: buildJudgeSystemPrompt(body.topic, body.transcript),
					messages: [
						{
							role: 'user' as const,
							content: 'Judge this roast battle now.',
						},
					],
				});

				return result.toTextStreamResponse();
			},
			{
				body: t.Object({
					topic: t.String({ minLength: 1 }),
					transcript: t.String({ minLength: 1 }),
				}),
			}
		);
}
