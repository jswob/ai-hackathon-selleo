import { describe, expect, test } from 'vitest';
import { roastBattleReducer, type RoastBattleState } from './useRoastBattle';

function makeInitialState(overrides: Partial<RoastBattleState> = {}): RoastBattleState {
	return {
		phase: 'TOPIC_INPUT',
		topic: '',
		messages: [],
		turn: 'player',
		isStreaming: false,
		verdict: '',
		winner: null,
		...overrides,
	};
}

describe('roastBattleReducer', () => {
	test('initial state is TOPIC_INPUT phase', () => {
		const state = makeInitialState();
		expect(state.phase).toBe('TOPIC_INPUT');
		expect(state.messages).toEqual([]);
	});

	test('START_BATTLE sets phase, topic, and turn', () => {
		const state = makeInitialState();
		const next = roastBattleReducer(state, {
			type: 'START_BATTLE',
			topic: 'cats',
			firstTurn: 'player',
		});

		expect(next.phase).toBe('BATTLE');
		expect(next.topic).toBe('cats');
		expect(next.turn).toBe('player');
		expect(next.messages).toEqual([]);
	});

	test('START_BATTLE with AI first turn', () => {
		const state = makeInitialState();
		const next = roastBattleReducer(state, {
			type: 'START_BATTLE',
			topic: 'dogs',
			firstTurn: 'ai',
		});

		expect(next.turn).toBe('ai');
	});

	test('SEND_PLAYER_MESSAGE appends message and flips turn', () => {
		const state = makeInitialState({
			phase: 'BATTLE',
			topic: 'cats',
			turn: 'player',
		});

		const next = roastBattleReducer(state, {
			type: 'SEND_PLAYER_MESSAGE',
			content: 'Cats are just tiny ungrateful lions',
		});

		expect(next.messages).toHaveLength(1);
		expect(next.messages[0]).toEqual({
			role: 'player',
			content: 'Cats are just tiny ungrateful lions',
		});
		expect(next.turn).toBe('ai');
	});

	test('SEND_PLAYER_MESSAGE is ignored when not player turn', () => {
		const state = makeInitialState({
			phase: 'BATTLE',
			turn: 'ai',
		});

		const next = roastBattleReducer(state, {
			type: 'SEND_PLAYER_MESSAGE',
			content: 'Trying to cheat',
		});

		expect(next.messages).toHaveLength(0);
	});

	test('SEND_PLAYER_MESSAGE is ignored while streaming', () => {
		const state = makeInitialState({
			phase: 'BATTLE',
			turn: 'player',
			isStreaming: true,
		});

		const next = roastBattleReducer(state, {
			type: 'SEND_PLAYER_MESSAGE',
			content: 'Nope',
		});

		expect(next.messages).toHaveLength(0);
	});

	test('START_AI_STREAM sets streaming state and adds empty AI message', () => {
		const state = makeInitialState({
			phase: 'BATTLE',
			turn: 'ai',
		});

		const next = roastBattleReducer(state, { type: 'START_AI_STREAM' });

		expect(next.isStreaming).toBe(true);
		expect(next.messages).toHaveLength(1);
		expect(next.messages[0]).toEqual({ role: 'ai', content: '' });
	});

	test('APPEND_AI_CHUNK appends to last message', () => {
		const state = makeInitialState({
			phase: 'BATTLE',
			isStreaming: true,
			messages: [{ role: 'ai', content: 'You ' }],
		});

		const next = roastBattleReducer(state, {
			type: 'APPEND_AI_CHUNK',
			chunk: 'call that a roast?',
		});

		expect(next.messages[0].content).toBe('You call that a roast?');
	});

	test('FINISH_AI_STREAM flips turn to player', () => {
		const state = makeInitialState({
			phase: 'BATTLE',
			isStreaming: true,
			turn: 'ai',
			messages: [
				{ role: 'player', content: 'roast' },
				{ role: 'ai', content: 'counter' },
			],
		});

		const next = roastBattleReducer(state, { type: 'FINISH_AI_STREAM' });

		expect(next.isStreaming).toBe(false);
		expect(next.turn).toBe('player');
	});

	test('FINISH_AI_STREAM triggers JUDGING at 10 messages', () => {
		const messages = Array.from({ length: 10 }, (_, i) => ({
			role: i % 2 === 0 ? 'player' : 'ai',
			content: `roast ${i}`,
		}));

		const state = makeInitialState({
			phase: 'BATTLE',
			isStreaming: true,
			messages,
		});

		const next = roastBattleReducer(state, { type: 'FINISH_AI_STREAM' });

		expect(next.phase).toBe('JUDGING');
	});

	test('FINISH_AI_STREAM stays in BATTLE with fewer than 10 messages', () => {
		const state = makeInitialState({
			phase: 'BATTLE',
			isStreaming: true,
			messages: [
				{ role: 'player', content: 'roast' },
				{ role: 'ai', content: 'counter' },
			],
		});

		const next = roastBattleReducer(state, { type: 'FINISH_AI_STREAM' });

		expect(next.phase).toBe('BATTLE');
	});

	test('APPEND_VERDICT_CHUNK accumulates verdict', () => {
		const state = makeInitialState({
			phase: 'JUDGING',
			verdict: 'WINNER: ',
		});

		const next = roastBattleReducer(state, {
			type: 'APPEND_VERDICT_CHUNK',
			chunk: 'Player',
		});

		expect(next.verdict).toBe('WINNER: Player');
	});

	test('FINISH_JUDGING parses "WINNER: Player" correctly', () => {
		const verdict = 'WINNER: Player\nVERDICT: Absolutely devastating roasts!';
		const state = makeInitialState({ phase: 'JUDGING' });

		const next = roastBattleReducer(state, {
			type: 'FINISH_JUDGING',
			verdict,
		});

		expect(next.phase).toBe('RESULT');
		expect(next.winner).toBe('Player');
		expect(next.verdict).toBe(verdict);
	});

	test('FINISH_JUDGING parses "WINNER: AI" correctly', () => {
		const verdict = 'WINNER: AI\nVERDICT: The machine was funnier!';
		const state = makeInitialState({ phase: 'JUDGING' });

		const next = roastBattleReducer(state, {
			type: 'FINISH_JUDGING',
			verdict,
		});

		expect(next.winner).toBe('AI');
	});

	test('FINISH_JUDGING fallback on unparseable verdict', () => {
		const verdict = 'Both sides were equally terrible.';
		const state = makeInitialState({ phase: 'JUDGING' });

		const next = roastBattleReducer(state, {
			type: 'FINISH_JUDGING',
			verdict,
		});

		expect(next.winner).toBe('Draw');
	});

	test('RESET returns to initial state', () => {
		const state = makeInitialState({
			phase: 'RESULT',
			topic: 'cats',
			messages: [{ role: 'player', content: 'roast' }],
			winner: 'Player',
			verdict: 'Player wins!',
		});

		const next = roastBattleReducer(state, { type: 'RESET' });

		expect(next.phase).toBe('TOPIC_INPUT');
		expect(next.topic).toBe('');
		expect(next.messages).toEqual([]);
		expect(next.winner).toBeNull();
		expect(next.verdict).toBe('');
	});

	test('round counter calculation', () => {
		// 0 messages = round 1
		expect(Math.floor(0 / 2) + 1).toBe(1);
		// 2 messages = round 2
		expect(Math.floor(2 / 2) + 1).toBe(2);
		// 4 messages = round 3
		expect(Math.floor(4 / 2) + 1).toBe(3);
		// 9 messages = round 5
		expect(Math.floor(9 / 2) + 1).toBe(5);
	});
});
