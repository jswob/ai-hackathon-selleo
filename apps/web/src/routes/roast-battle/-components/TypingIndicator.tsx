interface TypingIndicatorProps {
	isAiTyping: boolean;
}

export function TypingIndicator({ isAiTyping }: TypingIndicatorProps) {
	if (isAiTyping) {
		return (
			<div className="flex items-center gap-1 text-sm text-text-secondary">
				<span>Roast Bot is typing</span>
				<span className="flex gap-0.5">
					<span className="animate-bounce" style={{ animationDelay: '0ms' }}>
						.
					</span>
					<span className="animate-bounce" style={{ animationDelay: '150ms' }}>
						.
					</span>
					<span className="animate-bounce" style={{ animationDelay: '300ms' }}>
						.
					</span>
				</span>
			</div>
		);
	}

	return <div className="text-sm text-text-muted">Your turn... hit them with your best roast!</div>;
}
