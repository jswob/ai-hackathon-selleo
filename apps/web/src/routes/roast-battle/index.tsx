import { createFileRoute } from '@tanstack/react-router';
import { BattleArena } from './-components/BattleArena';
import { JudgingOverlay } from './-components/JudgingOverlay';
import { ResultScreen } from './-components/ResultScreen';
import { TopicInput } from './-components/TopicInput';
import { useRoastBattle } from './-hooks/useRoastBattle';

export const Route = createFileRoute('/roast-battle/')({
	component: RoastBattlePage,
});

function RoastBattlePage() {
	const { state, startBattle, sendPlayerMessage, reset, currentRound, totalRounds } =
		useRoastBattle();

	switch (state.phase) {
		case 'TOPIC_INPUT':
			return <TopicInput onStart={startBattle} />;

		case 'BATTLE':
			return (
				<BattleArena
					messages={state.messages}
					isPlayerTurn={state.turn === 'player'}
					isStreaming={state.isStreaming}
					currentRound={currentRound}
					totalRounds={totalRounds}
					topic={state.topic}
					onSendMessage={sendPlayerMessage}
				/>
			);

		case 'JUDGING':
			return <JudgingOverlay verdict={state.verdict} />;

		case 'RESULT':
			return (
				<ResultScreen winner={state.winner ?? 'Draw'} verdict={state.verdict} onPlayAgain={reset} />
			);
	}
}
