interface JudgingOverlayProps {
	verdict: string;
}

export function JudgingOverlay({ verdict }: JudgingOverlayProps) {
	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center gap-8">
			<div className="flex flex-col items-center gap-4">
				<div className="animate-pulse text-4xl">&#9878;</div>
				<h2 className="text-xl font-bold text-text-primary">The Judge is deliberating...</h2>
			</div>

			{verdict && (
				<div className="max-w-lg rounded-lg border border-border-primary bg-bg-secondary p-6 text-sm leading-relaxed text-text-secondary">
					{verdict}
				</div>
			)}
		</div>
	);
}
