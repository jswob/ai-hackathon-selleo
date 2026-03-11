import { cva, type VariantProps } from 'class-variance-authority';
import { Check, X } from 'lucide-react';

import { cn } from '@/lib/utils';

const checkboxVariants = cva(
	'inline-flex cursor-pointer items-center justify-center gap-2 border rounded-sm transition-colors focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50',
	{
		variants: {
			size: {
				sm: 'h-8 w-8 text-[13px]',
				md: 'h-9 w-9 text-sm',
			},
			checked: {
				true: 'bg-primary text-white border-primary hover:bg-primary-hover',
				false: 'bg-bg-secondary text-text-primary border-border-primary hover:bg-bg-hover',
			},
		},
		defaultVariants: { size: 'md', checked: false },
	}
);

type CheckboxInputProps = Omit<React.ComponentProps<'button'>, 'size' | 'value' | 'onChange'> & {
	value: string | null;
	onChange: (value: string) => void;
	size?: VariantProps<typeof checkboxVariants>['size'];
	disabled?: boolean;
	className?: string;
};

/** Rectangular toggle button that displays a Check or X icon for boolean trait values. */
export function CheckboxInput({
	value,
	onChange,
	size,
	disabled,
	className,
	...rest
}: CheckboxInputProps) {
	const isChecked = value === 'true';

	const handleClick = () => {
		if (disabled) return;
		onChange(isChecked ? 'false' : 'true');
	};

	return (
		<button
			type="button"
			role="checkbox"
			aria-checked={isChecked}
			disabled={disabled}
			className={cn(checkboxVariants({ size, checked: isChecked }), className)}
			onClick={handleClick}
			{...rest}
		>
			{isChecked ? (
				<Check data-testid="check-icon" aria-hidden="true" className="h-4 w-4" />
			) : (
				<X data-testid="x-icon" aria-hidden="true" className="h-4 w-4" />
			)}
		</button>
	);
}
