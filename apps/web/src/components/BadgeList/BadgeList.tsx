import { Badge, type BadgeProps } from '@/components/Badge';
import { Tooltip } from '@/components/Tooltip';

export type LabelColor = 'purple' | 'teal' | 'rose' | 'amber' | 'blue' | 'lime' | 'cyan' | 'orange';

export interface BadgeItem {
	key: string;
	label: string;
	color: LabelColor;
}

export interface BadgeListProps {
	items: BadgeItem[];
	maxVisible?: number;
	variant?: BadgeProps['variant'];
}

/** Renders a list of badges with overflow shown in a tooltip. */
export function BadgeList({ items, maxVisible = 3, variant }: BadgeListProps) {
	if (items.length === 0) {
		return <span className="text-text-secondary">--</span>;
	}

	const visible = items.slice(0, maxVisible);
	const overflow = items.slice(maxVisible);

	return (
		<span className="inline-flex flex-wrap items-center gap-1">
			{visible.map(item => (
				<Badge key={item.key} variant={variant} color={item.color}>
					{item.label}
				</Badge>
			))}
			{overflow.length > 0 && (
				<Tooltip
					content={
						<span className="flex flex-wrap gap-1">
							{overflow.map(item => (
								<Badge key={item.key} variant={variant} color={item.color}>
									{item.label}
								</Badge>
							))}
						</span>
					}
				>
					<Badge variant={variant} color="neutral">
						+{overflow.length} more
					</Badge>
				</Tooltip>
			)}
		</span>
	);
}
