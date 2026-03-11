import {
	Combobox,
	ComboboxButton,
	ComboboxInput,
	ComboboxOption,
	ComboboxOptions,
	Listbox,
	ListboxButton,
	ListboxOption,
	ListboxOptions,
} from '@headlessui/react';
import { type VariantProps } from 'class-variance-authority';
import { Check, ChevronDown, X } from 'lucide-react';
import { useId, useMemo, useRef, useState } from 'react';

import { Badge } from '@/components/Badge';
import { inputVariants } from '@/components/Input';
import { cn } from '@/lib/utils';

export type SelectOption = {
	value: string;
	label: string;
	disabled?: boolean;
};

export type SelectOptionGroup = {
	type: 'group';
	label: string;
	options: SelectOption[];
};

export type SelectOptionOrGroup = SelectOption | SelectOptionGroup;

/**
 * Type guard to check if option is a group.
 */
function isOptionGroup(option: SelectOptionOrGroup): option is SelectOptionGroup {
	return 'type' in option && option.type === 'group';
}

type Size = VariantProps<typeof inputVariants>['size'];

type SingleSelectProps = {
	options: SelectOptionOrGroup[];
	value: string | null;
	onChange: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
	size?: Size;
	className?: string;
	searchable?: false;
	multiple?: false;
	error?: string;
};

type SearchableSingleSelectProps = {
	options: SelectOption[];
	value: string | null;
	onChange: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
	size?: Size;
	className?: string;
	searchable: true;
	multiple?: false;
	error?: string;
};

type MultiSelectProps = {
	options: SelectOption[];
	value: string[];
	onChange: (value: string[]) => void;
	placeholder?: string;
	disabled?: boolean;
	size?: Size;
	className?: string;
	multiple: true;
	badgeColor?: 'primary' | 'danger' | 'success' | 'warning' | 'neutral';
	searchable?: never;
	'aria-label'?: string;
	error?: string;
};

export type SelectInputProps = SingleSelectProps | SearchableSingleSelectProps | MultiSelectProps;

/** Flexible select input supporting single, searchable, and multi-select modes. */
export function SelectInput(props: SelectInputProps) {
	if (props.multiple) {
		return <MultiSelect {...props} />;
	}
	if (props.searchable) {
		return <SearchableSingleSelect {...props} />;
	}
	return <SingleSelect {...props} />;
}

function SingleSelect({
	options,
	value,
	onChange,
	placeholder = 'Select...',
	disabled,
	size,
	className,
	error,
}: SingleSelectProps) {
	const errorId = useId();
	const hasError = Boolean(error);

	// Find selected option (works for both flat and grouped options)
	const selectedOption = useMemo(() => {
		for (const option of options) {
			if (isOptionGroup(option)) {
				const found = option.options.find(o => o.value === value);
				if (found) return found;
			} else if (option.value === value) {
				return option;
			}
		}
		return null;
	}, [options, value]);

	// Check if options contain any groups
	const hasGroups = useMemo(() => options.some(isOptionGroup), [options]);

	// Helper function to render an option (reduces duplication)
	const renderOption = (option: SelectOption) => (
		<ListboxOption
			key={option.value}
			value={option.value}
			disabled={option.disabled}
			className="flex cursor-pointer items-center px-3 py-1.5 text-sm text-text-primary data-disabled:cursor-not-allowed data-disabled:opacity-50 data-focus:bg-bg-hover"
		>
			{({ selected }) => (
				<>
					{selected ? (
						<Check aria-hidden="true" className="mr-2 h-4 w-4 text-primary" />
					) : (
						<span className="ml-6" />
					)}
					{option.label}
				</>
			)}
		</ListboxOption>
	);

	return (
		<Listbox value={value ?? undefined} onChange={onChange} disabled={disabled}>
			<div>
				<ListboxButton
					className={cn(
						inputVariants({ size }),
						'flex cursor-pointer items-center justify-between text-left',
						hasError && 'border-danger focus:border-danger focus:ring-danger/10',
						className
					)}
					aria-invalid={hasError || undefined}
					aria-describedby={hasError ? errorId : undefined}
				>
					<span className={cn(!selectedOption && 'text-text-muted')}>
						{selectedOption ? selectedOption.label : placeholder}
					</span>
					<ChevronDown aria-hidden="true" className="h-4 w-4 text-text-muted" />
				</ListboxButton>

				<ListboxOptions
					anchor="bottom start"
					className="z-60 [--anchor-gap:4px] w-(--button-width) max-h-60 overflow-auto scrollbar-styled rounded-sm border border-border-primary bg-bg-secondary py-1 shadow-md"
				>
					{hasGroups
						? // Grouped rendering
							options.map(optionOrGroup => {
								if (isOptionGroup(optionOrGroup)) {
									const groupId = `group-label-${optionOrGroup.label}`;

									return (
										<div key={optionOrGroup.label} role="group" aria-labelledby={groupId}>
											{/* Group header (non-interactive label) */}
											<div
												id={groupId}
												className="px-3 py-1.5 text-xs font-semibold text-text-secondary uppercase"
											>
												{optionOrGroup.label}
											</div>

											{/* Group options (always shown) */}
											{optionOrGroup.options.length > 0 ? (
												<div className="pl-3">
													{optionOrGroup.options.map(option => (
														<ListboxOption
															key={option.value}
															value={option.value}
															disabled={option.disabled}
															className="flex cursor-pointer items-center px-3 py-1.5 text-sm text-text-primary data-disabled:cursor-not-allowed data-disabled:opacity-50 data-focus:bg-bg-hover"
														>
															{({ selected }) => (
																<>
																	{selected ? (
																		<Check
																			aria-hidden="true"
																			className="mr-2 h-4 w-4 text-primary"
																		/>
																	) : (
																		<span className="ml-6" />
																	)}
																	{option.label}
																</>
															)}
														</ListboxOption>
													))}
												</div>
											) : null}
										</div>
									);
								} else {
									// Flat option (ungrouped)
									return renderOption(optionOrGroup);
								}
							})
						: // Flat rendering (backward compatible — no groups)
							options.map(option => renderOption(option as SelectOption))}
				</ListboxOptions>
				{hasError && (
					<p id={errorId} role="alert" className="mt-1 text-xs text-danger">
						{error}
					</p>
				)}
			</div>
		</Listbox>
	);
}

function SearchableSingleSelect({
	options,
	value,
	onChange,
	placeholder = 'Select...',
	disabled,
	size,
	className,
	error,
}: SearchableSingleSelectProps) {
	const errorId = useId();
	const hasError = Boolean(error);
	const [query, setQuery] = useState('');

	const filteredOptions = useMemo(
		() =>
			query === ''
				? options
				: options.filter(o => o.label.toLowerCase().includes(query.toLowerCase())),
		[options, query]
	);

	return (
		<Combobox
			value={value}
			onChange={(val: string | null) => {
				if (val !== null) onChange(val);
			}}
			disabled={disabled}
			onClose={() => setQuery('')}
		>
			<div>
				<div className="relative">
					<ComboboxInput
						className={cn(
							inputVariants({ size }),
							hasError && 'border-danger focus:border-danger focus:ring-danger/10',
							className
						)}
						placeholder={placeholder}
						displayValue={(val: string | null) => options.find(o => o.value === val)?.label ?? ''}
						onChange={e => setQuery(e.target.value)}
						aria-invalid={hasError || undefined}
						aria-describedby={hasError ? errorId : undefined}
					/>
					<ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
						<ChevronDown aria-hidden="true" className="h-4 w-4 text-text-muted" />
					</ComboboxButton>

					<ComboboxOptions
						anchor="bottom start"
						className="z-60 [--anchor-gap:4px] w-(--input-width) max-h-60 overflow-auto scrollbar-styled rounded-sm border border-border-primary bg-bg-secondary py-1 shadow-md"
					>
						{filteredOptions.length === 0 ? (
							<div className="px-3 py-2 text-sm text-text-muted">No results found</div>
						) : (
							filteredOptions.map(option => (
								<ComboboxOption
									key={option.value}
									value={option.value}
									disabled={option.disabled}
									className="flex cursor-pointer items-center px-3 py-1.5 text-sm text-text-primary data-disabled:cursor-not-allowed data-disabled:opacity-50 data-focus:bg-bg-hover"
								>
									{({ selected }) => (
										<>
											{selected ? (
												<Check aria-hidden="true" className="mr-2 h-4 w-4 text-primary" />
											) : (
												<span className="ml-6" />
											)}
											{option.label}
										</>
									)}
								</ComboboxOption>
							))
						)}
					</ComboboxOptions>
				</div>
				{hasError && (
					<p id={errorId} role="alert" className="mt-1 text-xs text-danger">
						{error}
					</p>
				)}
			</div>
		</Combobox>
	);
}

function MultiSelect({
	options,
	value,
	onChange,
	placeholder = 'Select...',
	disabled,
	size,
	className,
	badgeColor = 'primary',
	'aria-label': ariaLabel,
	error,
}: MultiSelectProps) {
	const errorId = useId();
	const hasError = Boolean(error);
	const [query, setQuery] = useState('');
	const inputRef = useRef<HTMLInputElement>(null);

	const filteredOptions = useMemo(
		() =>
			query === ''
				? options
				: options.filter(o => o.label.toLowerCase().includes(query.toLowerCase())),
		[options, query]
	);

	const selectedOptions = useMemo(
		() => options.filter(o => value.includes(o.value)),
		[options, value]
	);

	const handleRemove = (removedValue: string) => {
		onChange(value.filter(v => v !== removedValue));
	};

	return (
		<Combobox
			value={value}
			onChange={newValue => {
				onChange(newValue);
				setQuery('');
			}}
			disabled={disabled}
			multiple
			immediate
		>
			<div
				data-slot="select-wrapper"
				className={cn(
					inputVariants({ size }),
					'relative flex h-auto cursor-pointer flex-wrap items-center gap-1 pr-8 pt-1 pb-1',
					size === 'sm' ? 'min-h-8' : 'min-h-9',
					hasError && 'border-danger focus:border-danger focus:ring-danger/10',
					className
				)}
				onClick={() => inputRef.current?.focus()}
			>
				{/* Hidden ComboboxButton — only provides --button-width for dropdown sizing */}
				<ComboboxButton
					as="div"
					className="pointer-events-none absolute inset-0"
					aria-hidden="true"
				/>
				<ComboboxInput
					ref={inputRef}
					aria-label={ariaLabel}
					aria-invalid={hasError || undefined}
					aria-describedby={hasError ? errorId : undefined}
					className="order-last min-w-[60px] flex-1 border-none bg-transparent p-0 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-0"
					placeholder={selectedOptions.length === 0 ? placeholder : undefined}
					value={query}
					onChange={e => setQuery(e.target.value)}
					onKeyDown={e => {
						if (e.key === 'Backspace' && query === '' && value.length > 0) {
							e.preventDefault();
							onChange(value.slice(0, -1));
						}
					}}
				/>
				{selectedOptions.map(option => (
					<button
						key={option.value}
						type="button"
						aria-label={`Remove ${option.label}`}
						className="ml-0.5 inline-flex items-center rounded-sm cursor-pointer hover:bg-black/10"
						onClick={e => {
							e.preventDefault();
							e.stopPropagation();
							handleRemove(option.value);
						}}
					>
						<Badge color={badgeColor} className="flex items-center gap-1">
							{option.label}
							<X aria-hidden="true" className="h-3 w-3" />
						</Badge>
					</button>
				))}
				<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
					<ChevronDown aria-hidden="true" className="h-4 w-4 text-text-muted" />
				</div>
			</div>

			{hasError && (
				<p id={errorId} role="alert" className="mt-1 text-xs text-danger">
					{error}
				</p>
			)}

			<ComboboxOptions
				anchor="bottom start"
				className="z-60 [--anchor-gap:4px] w-(--button-width) max-h-60 overflow-auto scrollbar-styled rounded-sm border border-border-primary bg-bg-secondary py-1 shadow-md"
			>
				{filteredOptions.length === 0 ? (
					<div className="px-3 py-2 text-sm text-text-muted">No results found</div>
				) : (
					filteredOptions.map(option => (
						<ComboboxOption
							key={option.value}
							value={option.value}
							disabled={option.disabled}
							className="flex cursor-pointer items-center px-3 py-1.5 text-sm text-text-primary data-disabled:cursor-not-allowed data-disabled:opacity-50 data-focus:bg-bg-hover"
						>
							{({ selected }) => (
								<>
									{selected ? (
										<Check aria-hidden="true" className="mr-2 h-4 w-4 text-primary" />
									) : (
										<span className="ml-6" />
									)}
									{option.label}
								</>
							)}
						</ComboboxOption>
					))
				)}
			</ComboboxOptions>
		</Combobox>
	);
}
