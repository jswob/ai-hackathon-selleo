import { cva } from 'class-variance-authority';

export const dropdownMenuItemVariants = cva(
	'flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-bg-secondary disabled:cursor-not-allowed disabled:opacity-50',
	{
		variants: {
			variant: {
				default: 'text-text-primary',
				destructive: 'text-danger',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	}
);
