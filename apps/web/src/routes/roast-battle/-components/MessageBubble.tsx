import { cn } from '@/lib/utils';

interface MessageBubbleProps {
	role: 'player' | 'ai';
	content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
	const isPlayer = role === 'player';

	return (
		<div className={cn('flex flex-col gap-1', isPlayer ? 'items-end' : 'items-start')}>
			<span className="text-xs font-medium text-text-secondary">
				{isPlayer ? 'You' : 'Roast Bot'}
			</span>
			<div
				className={cn(
					'max-w-[80%] rounded-lg px-4 py-2 text-sm',
					isPlayer ? 'bg-primary text-primary-foreground' : 'bg-bg-tertiary text-text-primary'
				)}
			>
				{content}
			</div>
		</div>
	);
}
