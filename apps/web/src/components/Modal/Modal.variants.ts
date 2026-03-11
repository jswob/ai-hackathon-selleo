import { cva } from 'class-variance-authority';

export const modalPanelVariants = cva(
	'relative w-full rounded-lg border border-border-primary bg-bg-secondary shadow-lg',
	{
		variants: {
			size: {
				sm: 'max-w-sm',
				md: 'max-w-md',
				lg: 'max-w-lg',
				xl: 'max-w-xl',
				'2xl': 'max-w-2xl',
				'3xl': 'max-w-3xl',
				'4xl': 'max-w-4xl',
				'5xl': 'max-w-5xl',
			},
		},
		defaultVariants: { size: 'md' },
	}
);
