import { useCallback, useEffect, useReducer, useRef } from 'react';
import { ENV } from '@/env';

export type Phase = 'TOPIC_INPUT' | 'BATTLE' | 'JUDGING' | 'RESULT';
export type Turn = 'player' | 'ai';
export type Winner = 'Player' | 'AI' | 'Draw';

export interface Message {
	role: 'player' | 'ai';
	content: string;
}

export interface RoastBattleState {
	phase: Phase;
	topic: string;
	messages: Message[];
	turn: Turn;
	isStreaming: boolean;
	verdict: string;
	winner: Winner | null;
}

type Action =
	| { type: 'START_BATTLE'; topic: string; firstTurn: Turn }
	| { type: 'SEND_PLAYER_MESSAGE'; content: string }
	| { type: 'START_AI_STREAM' }
	| { type: 'APPEND_AI_CHUNK'; chunk: string }
	| { type: 'FINISH_AI_STREAM' }
	| { type: 'START_JUDGING' }
	| { type: 'APPEND_VERDICT_CHUNK'; chunk: string }
	| { type: 'FINISH_JUDGING'; verdict: string }
	| { type: 'RESET' };

const MAX_MESSAGES = 10;

const initialState: RoastBattleState = {
	phase: 'TOPIC_INPUT',
	topic: '',
	messages: [],
	turn: 'player',
	isStreaming: false,
	verdict: '',
	winner: null,
};

function parseWinner(verdict: string): Winner {
	const match = verdict.match(/WINNER:\s*(Player|AI)/i);
	if (!match) return 'Draw';
	return match[1] === 'Player' || match[1] === 'player' ? 'Player' : 'AI';
}

export function roastBattleReducer(state: RoastBattleState, action: Action): RoastBattleState {
	switch (action.type) {
		case 'START_BATTLE':
			return {
				...initialState,
				phase: 'BATTLE',
				topic: action.topic,
				turn: action.firstTurn,
			};

		case 'SEND_PLAYER_MESSAGE': {
			if (state.turn !== 'player' || state.isStreaming) return state;
			return {
				...state,
				messages: [...state.messages, { role: 'player', content: action.content }],
				turn: 'ai',
			};
		}

		case 'START_AI_STREAM':
			return {
				...state,
				isStreaming: true,
				messages: [...state.messages, { role: 'ai', content: '' }],
			};

		case 'APPEND_AI_CHUNK': {
			const msgs = [...state.messages];
			const last = msgs[msgs.length - 1];
			if (last && last.role === 'ai') {
				msgs[msgs.length - 1] = {
					...last,
					content: last.content + action.chunk,
				};
			}
			return { ...state, messages: msgs };
		}

		case 'FINISH_AI_STREAM': {
			const newState: RoastBattleState = {
				...state,
				isStreaming: false,
				turn: 'player',
			};
			if (state.messages.length >= MAX_MESSAGES) {
				return { ...newState, phase: 'JUDGING' };
			}
			return newState;
		}

		case 'START_JUDGING':
			return { ...state, phase: 'JUDGING', verdict: '' };

		case 'APPEND_VERDICT_CHUNK':
			return { ...state, verdict: state.verdict + action.chunk };

		case 'FINISH_JUDGING':
			return {
				...state,
				phase: 'RESULT',
				verdict: action.verdict,
				winner: parseWinner(action.verdict),
			};

		case 'RESET':
			return initialState;

		default:
			return state;
	}
}

/** Streams a roast response from the API */
async function streamRoast(
	topic: string,
	messages: Message[],
	onChunk: (chunk: string) => void,
	signal?: AbortSignal
): Promise<void> {
	const response = await fetch(`${ENV.VITE_API_URL}/roast-battle/roast`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			topic,
			messages: messages.map(m => ({
				role: m.role === 'player' ? 'user' : 'assistant',
				content: m.content,
			})),
		}),
		signal,
	});

	if (!response.body) return;
	const reader = response.body.getReader();
	const decoder = new TextDecoder();

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		onChunk(decoder.decode(value, { stream: true }));
	}
}

/** Streams a judgment from the API */
async function streamJudgment(
	topic: string,
	transcript: string,
	onChunk: (chunk: string) => void,
	signal?: AbortSignal
): Promise<string> {
	const response = await fetch(`${ENV.VITE_API_URL}/roast-battle/judge`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ topic, transcript }),
		signal,
	});

	if (!response.body) return '';
	const reader = response.body.getReader();
	const decoder = new TextDecoder();
	let fullText = '';

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		const chunk = decoder.decode(value, { stream: true });
		fullText += chunk;
		onChunk(chunk);
	}

	return fullText;
}

function formatTranscript(messages: Message[]): string {
	return messages.map(m => `${m.role === 'player' ? 'Player' : 'AI'}: ${m.content}`).join('\n');
}

export function useRoastBattle() {
	const [state, dispatch] = useReducer(roastBattleReducer, initialState);

	const messagesRef = useRef(state.messages);
	const topicRef = useRef(state.topic);
	const isStreamingRef = useRef(state.isStreaming);
	const verdictRef = useRef(state.verdict);
	const winnerRef = useRef(state.winner);
	messagesRef.current = state.messages;
	topicRef.current = state.topic;
	isStreamingRef.current = state.isStreaming;
	verdictRef.current = state.verdict;
	winnerRef.current = state.winner;

	const currentRound = Math.floor(state.messages.length / 2) + 1;
	const totalRounds = MAX_MESSAGES / 2;

	// Auto-trigger AI turn — only re-run when phase or turn changes
	useEffect(() => {
		if (state.phase !== 'BATTLE' || state.turn !== 'ai' || isStreamingRef.current) return;

		const controller = new AbortController();
		dispatch({ type: 'START_AI_STREAM' });

		void streamRoast(
			topicRef.current,
			messagesRef.current,
			chunk => dispatch({ type: 'APPEND_AI_CHUNK', chunk }),
			controller.signal
		)
			.then(() => dispatch({ type: 'FINISH_AI_STREAM' }))
			.catch(() => {
				if (!controller.signal.aborted) {
					dispatch({ type: 'FINISH_AI_STREAM' });
				}
			});

		return () => controller.abort();
	}, [state.phase, state.turn]);

	// Auto-trigger judging — only re-run when phase changes
	useEffect(() => {
		if (state.phase !== 'JUDGING' || verdictRef.current !== '' || winnerRef.current !== null)
			return;

		const controller = new AbortController();
		const transcript = formatTranscript(messagesRef.current);

		void streamJudgment(
			topicRef.current,
			transcript,
			chunk => dispatch({ type: 'APPEND_VERDICT_CHUNK', chunk }),
			controller.signal
		)
			.then(fullVerdict => dispatch({ type: 'FINISH_JUDGING', verdict: fullVerdict }))
			.catch(() => {
				if (!controller.signal.aborted) {
					dispatch({ type: 'FINISH_JUDGING', verdict: "Judging failed. It's a draw!" });
				}
			});

		return () => controller.abort();
	}, [state.phase]);

	const startBattle = useCallback((topic: string) => {
		const firstTurn: Turn = Math.random() < 0.5 ? 'player' : 'ai';
		dispatch({ type: 'START_BATTLE', topic, firstTurn });
	}, []);

	const sendPlayerMessage = useCallback((content: string) => {
		dispatch({ type: 'SEND_PLAYER_MESSAGE', content });
	}, []);

	const reset = useCallback(() => {
		dispatch({ type: 'RESET' });
	}, []);

	return {
		state,
		startBattle,
		sendPlayerMessage,
		reset,
		currentRound,
		totalRounds,
	};
}
