import type { VariantProps } from 'class-variance-authority';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

import { buttonVariants } from './Button.variants';

export type ButtonProps = React.ComponentProps<'button'> &
	VariantProps<typeof buttonVariants> & {
		leadingIcon?: LucideIcon;
		trailingIcon?: LucideIcon;
	};

export function Button({
	className,
	variant,
	size,
	type = 'button',
	leadingIcon: LeadingIcon,
	trailingIcon: TrailingIcon,
	children,
	...props
}: ButtonProps) {
	return (
		<button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props}>
			{LeadingIcon && <LeadingIcon aria-hidden="true" className="h-4 w-4" />}
			{children}
			{TrailingIcon && <TrailingIcon aria-hidden="true" className="h-4 w-4" />}
		</button>
	);
}
