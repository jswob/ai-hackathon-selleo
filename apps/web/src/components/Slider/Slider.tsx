import { cn } from '@/lib/utils';

interface SliderProps {
	value: number;
	onChange: (value: number) => void;
	min: number;
	max: number;
	step?: number;
	disabled?: boolean;
	'aria-label'?: string;
	className?: string;
}

/** Native range input with dark-theme styling. */
export function Slider({
	value,
	onChange,
	min,
	max,
	step,
	disabled,
	'aria-label': ariaLabel,
	className,
}: SliderProps) {
	return (
		<input
			type="range"
			role="slider"
			value={value}
			onChange={e => onChange(Number(e.target.value))}
			min={min}
			max={max}
			step={step}
			disabled={disabled}
			aria-label={ariaLabel}
			aria-valuemin={min}
			aria-valuemax={max}
			className={cn(
				'w-full cursor-pointer appearance-none rounded-full bg-transparent disabled:cursor-not-allowed disabled:opacity-50',
				'[&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-bg-tertiary',
				'[&::-webkit-slider-thumb]:mt-[-4px] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary',
				'[&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-bg-tertiary',
				'[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-primary',
				className
			)}
		/>
	);
}
