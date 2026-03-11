import { cva } from 'class-variance-authority';

export const toggleContainerVariants = cva(
	'relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50',
	{
		variants: {
			size: {
				xs: 'h-4 w-7',
				sm: 'h-5 w-9',
				md: 'h-6 w-11',
			},
			checked: {
				true: 'bg-primary',
				false: 'bg-border-primary',
			},
		},
		defaultVariants: { size: 'md', checked: false },
	}
);

export const toggleKnobVariants = cva(
	'pointer-events-none inline-block rounded-full bg-bg-secondary shadow-sm ring-0 transition-transform',
	{
		variants: {
			size: {
				xs: 'h-3 w-3',
				sm: 'h-4 w-4',
				md: 'h-5 w-5',
			},
			checked: {
				true: '',
				false: 'translate-x-0',
			},
		},
		compoundVariants: [
			{ size: 'sm', checked: true, class: 'translate-x-4' },
			{ size: 'sm', checked: false, class: 'translate-x-0' },
			{ size: 'md', checked: true, class: 'translate-x-5' },
			{ size: 'md', checked: false, class: 'translate-x-0' },
		],
		defaultVariants: { size: 'md', checked: false },
	}
);
