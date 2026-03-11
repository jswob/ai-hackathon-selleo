import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Winner } from '../-hooks/useRoastBattle';

interface ResultScreenProps {
	winner: Winner;
	verdict: string;
	onPlayAgain: () => void;
}

export function ResultScreen({ winner, verdict, onPlayAgain }: ResultScreenProps) {
	const isPlayerWin = winner === 'Player';
	const isAiWin = winner === 'AI';

	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center gap-8">
			<div
				className={cn(
					'rounded-xl p-8 text-center shadow-lg',
					isPlayerWin && 'border-2 border-success bg-success/10 shadow-success/20',
					isAiWin && 'border-2 border-danger bg-danger/10 shadow-danger/20',
					!isPlayerWin && !isAiWin && 'border-2 border-warning bg-warning/10 shadow-warning/20'
				)}
			>
				<h1 className="text-4xl font-extrabold">
					{isPlayerWin && 'You Win!'}
					{isAiWin && 'AI Wins!'}
					{!isPlayerWin && !isAiWin && "It's a Draw!"}
				</h1>
			</div>

			<div className="max-w-lg rounded-lg border border-border-primary bg-bg-secondary p-6 text-sm leading-relaxed text-text-secondary">
				{verdict}
			</div>

			<Button
				onClick={onPlayAgain}
				className="bg-primary text-primary-foreground hover:bg-primary/90"
			>
				Play Again
			</Button>
		</div>
	);
}
