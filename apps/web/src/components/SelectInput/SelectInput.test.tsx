import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SelectInput, type SelectOptionOrGroup } from './SelectInput';

const options = [
	{ value: 'alice', label: 'Alice' },
	{ value: 'bob', label: 'Bob' },
	{ value: 'charlie', label: 'Charlie' },
];

const disabledOptions = [
	{ value: 'alice', label: 'Alice' },
	{ value: 'bob', label: 'Bob', disabled: true },
	{ value: 'charlie', label: 'Charlie' },
];

describe('SelectInput', () => {
	describe('single select', () => {
		describe('rendering', () => {
			it('renders trigger button', () => {
				render(<SelectInput options={options} value={null} onChange={vi.fn()} />);

				expect(screen.getByRole('button')).toBeInTheDocument();
			});

			it('shows default placeholder', () => {
				render(<SelectInput options={options} value={null} onChange={vi.fn()} />);

				expect(screen.getByText('Select...')).toBeInTheDocument();
			});

			it('shows custom placeholder', () => {
				render(
					<SelectInput options={options} value={null} onChange={vi.fn()} placeholder="Pick one" />
				);

				expect(screen.getByText('Pick one')).toBeInTheDocument();
			});

			it('displays selected label in trigger', () => {
				render(<SelectInput options={options} value="bob" onChange={vi.fn()} />);

				expect(screen.getByText('Bob')).toBeInTheDocument();
			});

			it('renders chevron icon', () => {
				render(<SelectInput options={options} value={null} onChange={vi.fn()} />);

				const button = screen.getByRole('button');
				const svg = button.querySelector('svg');
				expect(svg).toBeInTheDocument();
			});

			it('applies inputVariants classes', () => {
				render(<SelectInput options={options} value={null} onChange={vi.fn()} />);

				const button = screen.getByRole('button');
				expect(button.className).toContain('border');
				expect(button.className).toContain('rounded-sm');
			});
		});

		describe('size variants', () => {
			it.each([
				{ size: 'sm' as const, expected: 'h-8' },
				{ size: 'md' as const, expected: 'h-9' },
			])('applies $expected class for size=$size', ({ size, expected }) => {
				render(<SelectInput options={options} value={null} onChange={vi.fn()} size={size} />);

				const button = screen.getByRole('button');
				expect(button.className).toContain(expected);
			});

			it('defaults to md size', () => {
				render(<SelectInput options={options} value={null} onChange={vi.fn()} />);

				const button = screen.getByRole('button');
				expect(button.className).toContain('h-9');
			});
		});

		describe('dropdown', () => {
			it('does not show options when closed', () => {
				render(<SelectInput options={options} value={null} onChange={vi.fn()} />);

				expect(screen.queryByRole('option')).not.toBeInTheDocument();
			});

			it('shows options on click', async () => {
				const user = userEvent.setup();

				render(<SelectInput options={options} value={null} onChange={vi.fn()} />);

				await user.click(screen.getByRole('button'));

				const optionElements = screen.getAllByRole('option');
				expect(optionElements).toHaveLength(3);
			});

			it('displays option labels', async () => {
				const user = userEvent.setup();

				render(<SelectInput options={options} value={null} onChange={vi.fn()} />);

				await user.click(screen.getByRole('button'));

				expect(screen.getByText('Alice')).toBeInTheDocument();
				expect(screen.getByText('Bob')).toBeInTheDocument();
				expect(screen.getByText('Charlie')).toBeInTheDocument();
			});
		});

		describe('selection', () => {
			it('calls onChange with selected value', async () => {
				const user = userEvent.setup();
				const handleChange = vi.fn();

				render(<SelectInput options={options} value={null} onChange={handleChange} />);

				await user.click(screen.getByRole('button'));
				await user.click(screen.getByRole('option', { name: /alice/i }));

				expect(handleChange).toHaveBeenCalledWith('alice');
			});

			it('shows check icon on selected option', async () => {
				const user = userEvent.setup();

				render(<SelectInput options={options} value="bob" onChange={vi.fn()} />);

				await user.click(screen.getByRole('button'));

				const bobOption = screen.getByRole('option', { name: /bob/i });
				const checkIcon = bobOption.querySelector('svg');
				expect(checkIcon).toBeInTheDocument();
			});

			it('does not show check icon on unselected options', async () => {
				const user = userEvent.setup();

				render(<SelectInput options={options} value="bob" onChange={vi.fn()} />);

				await user.click(screen.getByRole('button'));

				const aliceOption = screen.getByRole('option', { name: /alice/i });
				const svgs = aliceOption.querySelectorAll('svg');
				expect(svgs).toHaveLength(0);
			});
		});

		describe('disabled state', () => {
			it('disables trigger when disabled', () => {
				render(<SelectInput options={options} value={null} onChange={vi.fn()} disabled />);

				expect(screen.getByRole('button')).toBeDisabled();
			});

			it('marks disabled options with aria-disabled', async () => {
				const user = userEvent.setup();

				render(<SelectInput options={disabledOptions} value={null} onChange={vi.fn()} />);

				await user.click(screen.getByRole('button'));

				const bobOption = screen.getByRole('option', { name: /bob/i });
				expect(bobOption).toHaveAttribute('aria-disabled', 'true');
			});
		});

		describe('customization', () => {
			it('merges custom className onto trigger', () => {
				render(<SelectInput options={options} value={null} onChange={vi.fn()} className="ml-4" />);

				const button = screen.getByRole('button');
				expect(button.className).toContain('ml-4');
				expect(button.className).toContain('border');
			});
		});

		describe('keyboard', () => {
			it('opens on Enter', async () => {
				const user = userEvent.setup();

				render(<SelectInput options={options} value={null} onChange={vi.fn()} />);

				await user.tab();
				await user.keyboard(' ');

				expect(screen.getAllByRole('option')).toHaveLength(3);
			});

			it('closes on Escape', async () => {
				const user = userEvent.setup();

				render(<SelectInput options={options} value={null} onChange={vi.fn()} />);

				await user.click(screen.getByRole('button'));
				expect(screen.getAllByRole('option')).toHaveLength(3);

				await user.keyboard('{Escape}');

				expect(screen.queryByRole('option')).not.toBeInTheDocument();
			});
		});
	});

	describe('searchable single select', () => {
		it('renders combobox input', () => {
			render(<SelectInput options={options} value={null} onChange={vi.fn()} searchable={true} />);

			expect(screen.getByRole('combobox')).toBeInTheDocument();
		});

		it('shows placeholder in input', () => {
			render(
				<SelectInput
					options={options}
					value={null}
					onChange={vi.fn()}
					searchable={true}
					placeholder="Search..."
				/>
			);

			expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
		});

		it('displays selected value text in input', () => {
			render(<SelectInput options={options} value="bob" onChange={vi.fn()} searchable={true} />);

			const input = screen.getByRole('combobox');
			expect(input).toHaveValue('Bob');
		});

		it('filters options as user types', async () => {
			const user = userEvent.setup();

			render(<SelectInput options={options} value={null} onChange={vi.fn()} searchable={true} />);

			const input = screen.getByRole('combobox');
			await user.click(input);
			await user.type(input, 'ali');

			const optionElements = screen.getAllByRole('option');
			expect(optionElements).toHaveLength(1);
			expect(screen.getByText('Alice')).toBeInTheDocument();
		});

		it('filters case-insensitively', async () => {
			const user = userEvent.setup();

			render(<SelectInput options={options} value={null} onChange={vi.fn()} searchable={true} />);

			const input = screen.getByRole('combobox');
			await user.click(input);
			await user.type(input, 'BOB');

			const optionElements = screen.getAllByRole('option');
			expect(optionElements).toHaveLength(1);
			expect(screen.getByText('Bob')).toBeInTheDocument();
		});

		it('shows all options when query is empty', async () => {
			const user = userEvent.setup();

			render(<SelectInput options={options} value={null} onChange={vi.fn()} searchable={true} />);

			await user.click(screen.getByRole('button'));

			expect(screen.getAllByRole('option')).toHaveLength(3);
		});

		it('shows "No results found" when filter matches nothing', async () => {
			const user = userEvent.setup();

			render(<SelectInput options={options} value={null} onChange={vi.fn()} searchable={true} />);

			const input = screen.getByRole('combobox');
			await user.click(input);
			await user.type(input, 'xyz');

			expect(screen.queryByRole('option')).not.toBeInTheDocument();
			expect(screen.getByText('No results found')).toBeInTheDocument();
		});

		it('calls onChange with selected value', async () => {
			const user = userEvent.setup();
			const handleChange = vi.fn();

			render(
				<SelectInput options={options} value={null} onChange={handleChange} searchable={true} />
			);

			await user.click(screen.getByRole('button'));
			await user.click(screen.getByRole('option', { name: /alice/i }));

			expect(handleChange).toHaveBeenCalledWith('alice');
		});

		it('clears search after selection and displays selected label', async () => {
			const user = userEvent.setup();
			let value: string | null = null;

			const { rerender } = render(
				<SelectInput
					options={options}
					value={value}
					onChange={v => {
						value = v;
					}}
					searchable={true}
				/>
			);

			const input = screen.getByRole('combobox');
			await user.click(input);
			await user.type(input, 'ali');
			await user.click(screen.getByRole('option', { name: /alice/i }));

			rerender(
				<SelectInput options={options} value={value} onChange={vi.fn()} searchable={true} />
			);

			expect(screen.getByRole('combobox')).toHaveValue('Alice');
		});
	});

	describe('multi select', () => {
		it('renders combobox input', () => {
			render(<SelectInput options={options} value={[]} onChange={vi.fn()} multiple={true} />);

			expect(screen.getByRole('combobox')).toBeInTheDocument();
		});

		it('shows placeholder when empty', () => {
			render(
				<SelectInput
					options={options}
					value={[]}
					onChange={vi.fn()}
					multiple={true}
					placeholder="Select items..."
				/>
			);

			expect(screen.getByPlaceholderText('Select items...')).toBeInTheDocument();
		});

		it('renders Badge for each selected value', () => {
			render(
				<SelectInput
					options={options}
					value={['alice', 'bob']}
					onChange={vi.fn()}
					multiple={true}
				/>
			);

			expect(screen.getByText('Alice')).toBeInTheDocument();
			expect(screen.getByText('Bob')).toBeInTheDocument();
		});

		it('renders remove button per badge', () => {
			render(
				<SelectInput
					options={options}
					value={['alice', 'bob']}
					onChange={vi.fn()}
					multiple={true}
				/>
			);

			expect(screen.getByRole('button', { name: 'Remove Alice' })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: 'Remove Bob' })).toBeInTheDocument();
		});

		it('calls onChange with added value on selection', async () => {
			const user = userEvent.setup();
			const handleChange = vi.fn();

			render(
				<SelectInput options={options} value={['alice']} onChange={handleChange} multiple={true} />
			);

			await user.click(screen.getByRole('combobox'));
			await user.click(screen.getByRole('option', { name: /bob/i }));

			expect(handleChange).toHaveBeenCalledWith(['alice', 'bob']);
		});

		it('calls onChange with removed value on re-selection', async () => {
			const user = userEvent.setup();
			const handleChange = vi.fn();

			render(
				<SelectInput
					options={options}
					value={['alice', 'bob']}
					onChange={handleChange}
					multiple={true}
				/>
			);

			await user.click(screen.getByRole('combobox'));
			await user.click(screen.getByRole('option', { name: /alice/i }));

			expect(handleChange).toHaveBeenCalledWith(['bob']);
		});

		it('keeps dropdown open after selection', async () => {
			const user = userEvent.setup();

			render(<SelectInput options={options} value={[]} onChange={vi.fn()} multiple={true} />);

			await user.click(screen.getByRole('combobox'));
			await user.click(screen.getByRole('option', { name: /alice/i }));

			expect(screen.getAllByRole('option')).toHaveLength(3);
		});

		it('badge X click removes item', async () => {
			const user = userEvent.setup();
			const handleChange = vi.fn();

			render(
				<SelectInput
					options={options}
					value={['alice', 'bob']}
					onChange={handleChange}
					multiple={true}
				/>
			);

			await user.click(screen.getByRole('button', { name: 'Remove Alice' }));

			expect(handleChange).toHaveBeenCalledWith(['bob']);
		});

		it('filters options via search', async () => {
			const user = userEvent.setup();

			render(<SelectInput options={options} value={[]} onChange={vi.fn()} multiple={true} />);

			const input = screen.getByRole('combobox');
			await user.click(input);
			await user.type(input, 'cha');

			const optionElements = screen.getAllByRole('option');
			expect(optionElements).toHaveLength(1);
			expect(screen.getByText('Charlie')).toBeInTheDocument();
		});

		it('clears search query after selection', async () => {
			const user = userEvent.setup();

			render(<SelectInput options={options} value={[]} onChange={vi.fn()} multiple={true} />);

			const input = screen.getByRole('combobox');
			await user.click(input);
			await user.type(input, 'ali');
			await user.click(screen.getByRole('option', { name: /alice/i }));

			expect(input).toHaveValue('');
		});

		it('shows check icons on selected options in dropdown', async () => {
			const user = userEvent.setup();

			render(<SelectInput options={options} value={['bob']} onChange={vi.fn()} multiple={true} />);

			await user.click(screen.getByRole('combobox'));

			const bobOption = screen.getByRole('option', { name: /bob/i });
			expect(bobOption.querySelector('svg')).toBeInTheDocument();

			const aliceOption = screen.getByRole('option', { name: /alice/i });
			expect(aliceOption.querySelectorAll('svg')).toHaveLength(0);
		});

		it('forwards aria-label to combobox input', () => {
			render(
				<SelectInput
					options={options}
					value={[]}
					onChange={vi.fn()}
					multiple={true}
					aria-label="Eligible Roles"
				/>
			);

			const input = screen.getByRole('combobox');
			expect(input).toHaveAttribute('aria-label', 'Eligible Roles');
		});

		it('is findable via getByLabelText with aria-label', () => {
			render(
				<SelectInput
					options={options}
					value={[]}
					onChange={vi.fn()}
					multiple={true}
					aria-label="Eligible Roles"
				/>
			);

			expect(screen.getByLabelText('Eligible Roles')).toBeInTheDocument();
		});

		it('backspace with empty input removes last selected item', async () => {
			const user = userEvent.setup();
			const handleChange = vi.fn();

			render(
				<SelectInput
					options={options}
					value={['alice', 'bob']}
					onChange={handleChange}
					multiple={true}
				/>
			);

			const input = screen.getByRole('combobox');
			await user.click(input);
			await user.keyboard('{Backspace}');

			expect(handleChange).toHaveBeenCalledWith(['alice']);
		});

		it('backspace with non-empty query does not remove items', async () => {
			const user = userEvent.setup();
			const handleChange = vi.fn();

			render(
				<SelectInput options={options} value={['alice']} onChange={handleChange} multiple={true} />
			);

			const input = screen.getByRole('combobox');
			await user.click(input);
			await user.type(input, 'bo');
			await user.keyboard('{Backspace}');

			// onChange should not have been called with a removal — only typing-related calls
			expect(handleChange).not.toHaveBeenCalledWith([]);
		});

		it('backspace with no selections does nothing', async () => {
			const user = userEvent.setup();
			const handleChange = vi.fn();

			render(<SelectInput options={options} value={[]} onChange={handleChange} multiple={true} />);

			const input = screen.getByRole('combobox');
			await user.click(input);
			await user.keyboard('{Backspace}');

			expect(handleChange).not.toHaveBeenCalled();
		});

		it('merges custom className on wrapper', () => {
			render(
				<SelectInput
					options={options}
					value={[]}
					onChange={vi.fn()}
					multiple={true}
					className="mt-2"
				/>
			);

			const wrapper = document.querySelector('[data-slot="select-wrapper"]');
			expect(wrapper).toBeInTheDocument();
			expect(wrapper?.className).toContain('mt-2');
		});
	});

	describe('single select error state', () => {
		it('shows error message when error prop provided', () => {
			render(<SelectInput options={options} value={null} onChange={vi.fn()} error="Required" />);

			expect(screen.getByText('Required')).toBeInTheDocument();
		});

		it('error message has role="alert"', () => {
			render(<SelectInput options={options} value={null} onChange={vi.fn()} error="Required" />);

			expect(screen.getByRole('alert')).toHaveTextContent('Required');
		});

		it('trigger has aria-invalid="true"', () => {
			render(<SelectInput options={options} value={null} onChange={vi.fn()} error="Required" />);

			expect(screen.getByRole('button')).toHaveAttribute('aria-invalid', 'true');
		});

		it('applies border-danger on trigger', () => {
			render(<SelectInput options={options} value={null} onChange={vi.fn()} error="Required" />);

			expect(screen.getByRole('button').className).toContain('border-danger');
		});

		it('no error attributes when error is undefined', () => {
			render(<SelectInput options={options} value={null} onChange={vi.fn()} />);

			expect(screen.queryByRole('alert')).not.toBeInTheDocument();
			expect(screen.getByRole('button')).not.toHaveAttribute('aria-invalid');
		});
	});

	describe('searchable select error state', () => {
		it('shows error message when error prop provided', () => {
			render(
				<SelectInput
					options={options}
					value={null}
					onChange={vi.fn()}
					searchable={true}
					error="Required"
				/>
			);

			expect(screen.getByText('Required')).toBeInTheDocument();
		});

		it('error message has role="alert"', () => {
			render(
				<SelectInput
					options={options}
					value={null}
					onChange={vi.fn()}
					searchable={true}
					error="Required"
				/>
			);

			expect(screen.getByRole('alert')).toHaveTextContent('Required');
		});

		it('combobox has aria-invalid="true"', () => {
			render(
				<SelectInput
					options={options}
					value={null}
					onChange={vi.fn()}
					searchable={true}
					error="Required"
				/>
			);

			expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
		});

		it('applies border-danger on combobox input', () => {
			render(
				<SelectInput
					options={options}
					value={null}
					onChange={vi.fn()}
					searchable={true}
					error="Required"
				/>
			);

			expect(screen.getByRole('combobox').className).toContain('border-danger');
		});

		it('no error attributes when error is undefined', () => {
			render(<SelectInput options={options} value={null} onChange={vi.fn()} searchable={true} />);

			expect(screen.queryByRole('alert')).not.toBeInTheDocument();
			expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-invalid');
		});
	});

	describe('multi select error state', () => {
		it('shows error message when error prop provided', () => {
			render(
				<SelectInput
					options={options}
					value={[]}
					onChange={vi.fn()}
					multiple={true}
					error="Required"
				/>
			);

			expect(screen.getByText('Required')).toBeInTheDocument();
		});

		it('error message has role="alert"', () => {
			render(
				<SelectInput
					options={options}
					value={[]}
					onChange={vi.fn()}
					multiple={true}
					error="Required"
				/>
			);

			expect(screen.getByRole('alert')).toHaveTextContent('Required');
		});

		it('combobox input has aria-invalid="true"', () => {
			render(
				<SelectInput
					options={options}
					value={[]}
					onChange={vi.fn()}
					multiple={true}
					error="Required"
				/>
			);

			expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
		});

		it('applies border-danger on wrapper', () => {
			render(
				<SelectInput
					options={options}
					value={[]}
					onChange={vi.fn()}
					multiple={true}
					error="Required"
				/>
			);

			const wrapper = document.querySelector('[data-slot="select-wrapper"]');
			expect(wrapper?.className).toContain('border-danger');
		});

		it('no error attributes when error is undefined', () => {
			render(<SelectInput options={options} value={[]} onChange={vi.fn()} multiple={true} />);

			expect(screen.queryByRole('alert')).not.toBeInTheDocument();
			expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-invalid');
		});
	});

	describe('grouped options', () => {
		const groupedOptions: SelectOptionOrGroup[] = [
			{
				type: 'group',
				label: 'Fruits',
				options: [
					{ label: 'Apple', value: 'apple' },
					{ label: 'Banana', value: 'banana' },
				],
			},
			{
				type: 'group',
				label: 'Vegetables',
				options: [
					{ label: 'Carrot', value: 'carrot' },
					{ label: 'Broccoli', value: 'broccoli' },
				],
			},
		];

		it('renders group headers and all options immediately', async () => {
			const user = userEvent.setup();
			const handleChange = vi.fn();
			render(
				<SelectInput
					options={groupedOptions}
					value={null}
					onChange={handleChange}
					placeholder="Select..."
				/>
			);

			const button = screen.getByRole('button', { name: /select/i });
			await user.click(button);

			// Group headers should be visible
			expect(screen.getByText('Fruits')).toBeInTheDocument();
			expect(screen.getByText('Vegetables')).toBeInTheDocument();

			// All options should be immediately visible (always-expanded)
			expect(screen.getByRole('option', { name: /apple/i })).toBeInTheDocument();
			expect(screen.getByRole('option', { name: /banana/i })).toBeInTheDocument();
			expect(screen.getByRole('option', { name: /carrot/i })).toBeInTheDocument();
			expect(screen.getByRole('option', { name: /broccoli/i })).toBeInTheDocument();
		});

		it('allows selecting option from any group', async () => {
			const user = userEvent.setup();
			const handleChange = vi.fn();
			render(
				<SelectInput
					options={groupedOptions}
					value={null}
					onChange={handleChange}
					placeholder="Select..."
				/>
			);

			const button = screen.getByRole('button', { name: /select/i });
			await user.click(button);

			const appleOption = screen.getByRole('option', { name: /apple/i });
			await user.click(appleOption);

			expect(handleChange).toHaveBeenCalledWith('apple');
		});

		it('displays selected value from grouped options', () => {
			const handleChange = vi.fn();
			render(
				<SelectInput
					options={groupedOptions}
					value="banana"
					onChange={handleChange}
					placeholder="Select..."
				/>
			);

			const button = screen.getByRole('button');
			expect(button).toHaveTextContent('Banana');
		});

		it('handles mixed flat and grouped options', async () => {
			const user = userEvent.setup();
			const mixedOptions: SelectOptionOrGroup[] = [
				{ label: 'Standalone', value: 'standalone' },
				{
					type: 'group',
					label: 'Grouped',
					options: [
						{ label: 'Option A', value: 'a' },
						{ label: 'Option B', value: 'b' },
					],
				},
			];

			const handleChange = vi.fn();
			render(
				<SelectInput
					options={mixedOptions}
					value={null}
					onChange={handleChange}
					placeholder="Select..."
				/>
			);

			const button = screen.getByRole('button', { name: /select/i });
			await user.click(button);

			// All options (flat and grouped) should be immediately visible
			expect(screen.getByRole('option', { name: /standalone/i })).toBeInTheDocument();
			expect(screen.getByRole('option', { name: /option a/i })).toBeInTheDocument();
			expect(screen.getByRole('option', { name: /option b/i })).toBeInTheDocument();
		});

		it('maintains backward compatibility with flat options', async () => {
			const user = userEvent.setup();

			const handleChange = vi.fn();
			render(
				<SelectInput
					options={options}
					value={null}
					onChange={handleChange}
					placeholder="Select..."
				/>
			);

			const button = screen.getByRole('button', { name: /select/i });
			await user.click(button);

			// All options should be immediately visible (no groups)
			expect(screen.getByRole('option', { name: /alice/i })).toBeInTheDocument();
			expect(screen.getByRole('option', { name: /bob/i })).toBeInTheDocument();
			expect(screen.getByRole('option', { name: /charlie/i })).toBeInTheDocument();
		});

		it('handles disabled options within groups', async () => {
			const user = userEvent.setup();
			const optionsWithDisabled: SelectOptionOrGroup[] = [
				{
					type: 'group',
					label: 'Options',
					options: [
						{ label: 'Enabled', value: 'enabled' },
						{ label: 'Disabled', value: 'disabled', disabled: true },
					],
				},
			];

			const handleChange = vi.fn();
			render(
				<SelectInput
					options={optionsWithDisabled}
					value={null}
					onChange={handleChange}
					placeholder="Select..."
				/>
			);

			const button = screen.getByRole('button', { name: /select/i });
			await user.click(button);

			const disabledOption = screen.getByRole('option', { name: /disabled/i });
			expect(disabledOption).toHaveAttribute('aria-disabled', 'true');

			// Clicking disabled option should not trigger onChange
			await user.click(disabledOption);
			expect(handleChange).not.toHaveBeenCalled();
		});

		it('shows placeholder when value is null with grouped options', () => {
			const handleChange = vi.fn();
			render(
				<SelectInput
					options={groupedOptions}
					value={null}
					onChange={handleChange}
					placeholder="Choose an option..."
				/>
			);

			const button = screen.getByRole('button');
			expect(button).toHaveTextContent('Choose an option...');
		});

		it('handles value not found in any group', () => {
			const handleChange = vi.fn();
			render(
				<SelectInput
					options={groupedOptions}
					value="nonexistent"
					onChange={handleChange}
					placeholder="Select..."
				/>
			);

			// Should show placeholder when selected value doesn't exist
			const button = screen.getByRole('button');
			expect(button).toHaveTextContent('Select...');
		});

		it('handles empty groups gracefully', async () => {
			const user = userEvent.setup();
			const optionsWithEmptyGroup: SelectOptionOrGroup[] = [
				{
					type: 'group',
					label: 'Empty Group',
					options: [],
				},
				{
					type: 'group',
					label: 'Non-empty Group',
					options: [{ label: 'Item', value: 'item' }],
				},
			];

			const handleChange = vi.fn();
			render(
				<SelectInput
					options={optionsWithEmptyGroup}
					value={null}
					onChange={handleChange}
					placeholder="Select..."
				/>
			);

			const button = screen.getByRole('button', { name: /select/i });
			await user.click(button);

			// Empty group header should render
			expect(screen.getByText('Empty Group')).toBeInTheDocument();

			// But no options under it
			expect(screen.getByRole('option', { name: /item/i })).toBeInTheDocument();
			expect(screen.queryAllByRole('option')).toHaveLength(1); // Only 1 option total
		});

		it('displays error state with grouped options', async () => {
			const user = userEvent.setup();
			const handleChange = vi.fn();
			render(
				<SelectInput
					options={groupedOptions}
					value={null}
					onChange={handleChange}
					placeholder="Select..."
					error="This field is required"
				/>
			);

			// Error message should be visible
			expect(screen.getByText('This field is required')).toBeInTheDocument();

			// Button should have error styling (aria-invalid)
			const button = screen.getByRole('button', { name: /select/i });
			expect(button).toHaveAttribute('aria-invalid', 'true');

			// Dropdown should still work
			await user.click(button);
			expect(screen.getByRole('option', { name: /apple/i })).toBeInTheDocument();
		});
	});
});
