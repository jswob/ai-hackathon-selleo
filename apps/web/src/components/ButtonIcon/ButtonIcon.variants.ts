import { cva } from 'class-variance-authority';

export const buttonIconVariants = cva(
	'inline-flex items-center justify-center rounded-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50',
	{
		variants: {
			variant: {
				default:
					'border border-border-primary bg-transparent text-text-primary hover:border-primary hover:bg-primary/10 hover:text-primary',
				secondary:
					'border border-border-primary bg-bg-secondary text-text-primary hover:border-border-secondary hover:bg-bg-tertiary',
				destructive:
					'border border-border-primary bg-transparent text-text-primary hover:border-danger hover:bg-danger/10 hover:text-danger',
				ghost: 'bg-transparent text-text-secondary hover:bg-bg-hover hover:text-text-primary',
			},
			size: {
				sm: 'h-7 w-7',
				md: 'h-8 w-8',
				lg: 'h-9 w-9',
			},
		},
		defaultVariants: { variant: 'default', size: 'md' },
	}
);
