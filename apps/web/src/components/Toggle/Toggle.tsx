import { Switch } from '@headlessui/react';
import type { VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { toggleContainerVariants, toggleKnobVariants } from './Toggle.variants';

type ToggleProps = {
	checked: boolean;
	onChange: (checked: boolean) => void;
	size?: VariantProps<typeof toggleContainerVariants>['size'];
	disabled?: boolean;
	className?: string;
	'aria-label'?: string;
};

/** Accessible toggle switch built on Headless UI Switch with CVA styling. */
export function Toggle({
	checked,
	onChange,
	size = 'md',
	disabled,
	className,
	'aria-label': ariaLabel,
}: ToggleProps) {
	return (
		<Switch
			checked={checked}
			onChange={onChange}
			disabled={disabled}
			aria-label={ariaLabel}
			className={cn(toggleContainerVariants({ size, checked }), className)}
		>
			<span
				aria-hidden="true"
				className={cn(toggleKnobVariants({ size, checked }), 'mt-0.5 ml-0.5')}
			/>
		</Switch>
	);
}
