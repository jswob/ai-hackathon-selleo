import type { VariantProps } from 'class-variance-authority';
import type { LucideIcon } from 'lucide-react';
import { useId, useRef } from 'react';

import { cn } from '@/lib/utils';

import { inputVariants } from './Input.variants';

export type InputProps = Omit<React.ComponentProps<'input'>, 'size' | 'pattern'> &
	VariantProps<typeof inputVariants> & {
		icon?: LucideIcon;
		error?: string;
		/**
		 * RegEx pattern to block invalid characters from being typed.
		 * Characters that don't match the pattern are silently blocked.
		 */
		pattern?: RegExp;
	};

export function Input({
	className,
	size,
	icon: Icon,
	error,
	pattern,
	onChange,
	...props
}: InputProps) {
	const errorId = useId();
	const hasError = Boolean(error);
	const lastValidValueRef = useRef<string>('');

	/**
	 * Handles input changes and filters out invalid characters based on pattern.
	 * Prevents invalid characters from appearing in the input field.
	 */
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!pattern) {
			onChange?.(e);
			return;
		}

		const newValue = e.target.value;

		// Test if the entire value matches the pattern
		if (!pattern.test(newValue)) {
			// Try character-by-character filtering first
			const filteredValue = newValue
				.split('')
				.filter(char => {
					// Test if this single character matches the pattern
					return pattern.test(char);
				})
				.join('');

			// If filtered value also doesn't match the pattern, revert to last valid value
			// (This handles structural patterns where individual chars match but sequences don't)
			if (!pattern.test(filteredValue)) {
				e.target.value = lastValidValueRef.current;
				return; // Don't call onChange since value didn't actually change
			}

			// Update the input value to the filtered value
			e.target.value = filteredValue;
		}

		// Store the new valid value
		lastValidValueRef.current = e.target.value;

		// Always call onChange (with original or filtered value)
		onChange?.(e);
	};

	return (
		<div>
			<div className="relative">
				{Icon && (
					<Icon
						aria-hidden="true"
						className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
					/>
				)}
				<input
					className={cn(
						inputVariants({ size }),
						Icon && 'pl-9',
						hasError && 'border-danger focus:border-danger focus:ring-danger/10',
						className
					)}
					aria-invalid={hasError || undefined}
					aria-describedby={hasError ? errorId : undefined}
					onChange={handleChange}
					{...props}
				/>
			</div>
			{hasError && (
				<p id={errorId} role="alert" className="mt-1 text-xs text-danger">
					{error}
				</p>
			)}
		</div>
	);
}
