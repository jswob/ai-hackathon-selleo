import { cva } from 'class-variance-authority';

export const badgeVariants = cva(
	'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
	{
		variants: {
			variant: {
				basic: '',
				outline: '',
			},
			color: {
				primary: '',
				danger: '',
				success: '',
				warning: '',
				purple: '',
				teal: '',
				rose: '',
				amber: '',
				blue: '',
				lime: '',
				cyan: '',
				orange: '',
				neutral: '',
			},
		},
		compoundVariants: [
			{ variant: 'basic', color: 'primary', class: 'bg-primary/15 text-primary' },
			{ variant: 'basic', color: 'danger', class: 'bg-danger/15 text-danger' },
			{ variant: 'basic', color: 'success', class: 'bg-success/15 text-success' },
			{ variant: 'basic', color: 'warning', class: 'bg-warning/15 text-warning' },
			{ variant: 'basic', color: 'purple', class: 'bg-purple/15 text-purple' },
			{ variant: 'basic', color: 'teal', class: 'bg-teal/15 text-teal' },
			{ variant: 'basic', color: 'rose', class: 'bg-rose/15 text-rose' },
			{ variant: 'basic', color: 'amber', class: 'bg-amber/15 text-amber' },
			{ variant: 'basic', color: 'blue', class: 'bg-blue/15 text-blue' },
			{ variant: 'basic', color: 'lime', class: 'bg-lime/15 text-lime' },
			{ variant: 'basic', color: 'cyan', class: 'bg-cyan/15 text-cyan' },
			{ variant: 'basic', color: 'orange', class: 'bg-orange/15 text-orange' },
			{ variant: 'basic', color: 'neutral', class: 'bg-text-secondary/10 text-text-secondary' },
			{
				variant: 'outline',
				color: 'primary',
				class: 'border border-primary/40 text-primary',
			},
			{ variant: 'outline', color: 'danger', class: 'border border-danger/40 text-danger' },
			{
				variant: 'outline',
				color: 'success',
				class: 'border border-success/40 text-success',
			},
			{
				variant: 'outline',
				color: 'warning',
				class: 'border border-warning/40 text-warning',
			},
			{ variant: 'outline', color: 'purple', class: 'border border-purple/40 text-purple' },
			{ variant: 'outline', color: 'teal', class: 'border border-teal/40 text-teal' },
			{ variant: 'outline', color: 'rose', class: 'border border-rose/40 text-rose' },
			{ variant: 'outline', color: 'amber', class: 'border border-amber/40 text-amber' },
			{ variant: 'outline', color: 'blue', class: 'border border-blue/40 text-blue' },
			{ variant: 'outline', color: 'lime', class: 'border border-lime/40 text-lime' },
			{ variant: 'outline', color: 'cyan', class: 'border border-cyan/40 text-cyan' },
			{ variant: 'outline', color: 'orange', class: 'border border-orange/40 text-orange' },
			{
				variant: 'outline',
				color: 'neutral',
				class: 'border border-border-secondary text-text-secondary',
			},
		],
		defaultVariants: {
			variant: 'basic',
			color: 'neutral',
		},
	}
);
