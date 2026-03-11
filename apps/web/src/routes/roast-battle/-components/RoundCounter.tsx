import { Badge } from '@/components/ui/badge';

interface RoundCounterProps {
	current: number;
	total: number;
}

export function RoundCounter({ current, total }: RoundCounterProps) {
	return (
		<Badge variant="secondary" className="bg-bg-tertiary text-text-secondary">
			Round {current} / {total}
		</Badge>
	);
}
