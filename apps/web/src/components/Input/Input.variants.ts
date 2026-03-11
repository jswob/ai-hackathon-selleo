import { cva } from 'class-variance-authority';

export const inputVariants = cva(
	'w-full bg-bg-secondary text-text-primary border border-border-primary rounded-sm placeholder:text-text-muted transition-colors focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50',
	{
		variants: {
			size: {
				sm: 'h-8 text-[13px] px-2.5',
				md: 'h-9 text-sm px-3',
			},
		},
		defaultVariants: { size: 'md' },
	}
);
