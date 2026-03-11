import type { VariantProps } from 'class-variance-authority';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

import { buttonIconVariants } from './ButtonIcon.variants';

export type ButtonIconProps = Omit<React.ComponentProps<'button'>, 'children'> &
	VariantProps<typeof buttonIconVariants> & {
		icon: LucideIcon;
		'aria-label': string;
	};

export function ButtonIcon({
	className,
	variant,
	size,
	type = 'button',
	icon: Icon,
	...props
}: ButtonIconProps) {
	return (
		<button type={type} className={cn(buttonIconVariants({ variant, size }), className)} {...props}>
			<Icon aria-hidden="true" className={cn(size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
		</button>
	);
}
