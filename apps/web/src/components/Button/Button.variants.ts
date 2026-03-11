import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
	'inline-flex items-center justify-center font-medium rounded-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50',
	{
		variants: {
			variant: {
				primary: 'bg-primary text-white hover:bg-primary-hover active:bg-primary-active',
				secondary:
					'bg-bg-secondary text-text-primary border border-border-primary hover:border-border-secondary hover:bg-bg-tertiary',
				ghost: 'bg-transparent text-text-secondary hover:bg-bg-hover hover:text-text-primary',
				destructive:
					'bg-transparent text-danger border border-border-primary hover:border-danger hover:bg-danger/10',
				dashed:
					'bg-transparent text-text-secondary border border-dashed border-border-secondary hover:border-text-muted hover:text-text-primary hover:bg-bg-hover',
			},
			size: {
				sm: 'h-8 text-[13px] px-3 gap-1.5',
				md: 'h-9 text-sm px-4 gap-2',
				lg: 'h-10 text-sm px-5 gap-2',
			},
		},
		defaultVariants: { variant: 'primary', size: 'md' },
	}
);
