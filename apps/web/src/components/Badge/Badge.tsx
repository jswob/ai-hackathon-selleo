import type { VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

import { badgeVariants } from './Badge.variants';

export type BadgeProps = React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>;

/** Inline badge for status labels, tags, and categories. */
export function Badge({ className, variant, color, ...props }: BadgeProps) {
	return <span className={cn(badgeVariants({ variant, color }), className)} {...props} />;
}
