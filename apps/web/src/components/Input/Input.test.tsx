import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Search } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';

import { Input } from './Input';

describe('Input', () => {
	describe('rendering', () => {
		it('renders an input element', () => {
			render(<Input placeholder="Enter text" />);

			expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
		});

		it('renders as an input element', () => {
			render(<Input placeholder="test" />);

			const input = screen.getByPlaceholderText('test');
			expect(input.tagName).toBe('INPUT');
		});

		it('applies base classes by default', () => {
			render(<Input placeholder="test" />);

			const input = screen.getByPlaceholderText('test');
			expect(input.className).toContain('w-full');
			expect(input.className).toContain('bg-bg-secondary');
			expect(input.className).toContain('text-text-primary');
			expect(input.className).toContain('border');
			expect(input.className).toContain('rounded-sm');
		});
	});

	describe('size variants', () => {
		it.each([
			{ size: 'sm' as const, expected: ['h-8', 'text-[13px]', 'px-2.5'] },
			{ size: 'md' as const, expected: ['h-9', 'text-sm', 'px-3'] },
		])('applies correct classes for size=$size', ({ size, expected }) => {
			render(<Input size={size} placeholder={size} />);

			const input = screen.getByPlaceholderText(size);
			for (const cls of expected) {
				expect(input.className).toContain(cls);
			}
		});

		it('defaults to md size', () => {
			render(<Input placeholder="default" />);

			const input = screen.getByPlaceholderText('default');
			expect(input.className).toContain('h-9');
		});
	});

	describe('leading icon', () => {
		it('renders icon when provided', () => {
			render(<Input icon={Search} placeholder="search" />);

			const icon = document.querySelector('svg');
			expect(icon).toBeInTheDocument();
			expect(icon).toHaveAttribute('aria-hidden', 'true');
		});

		it('does not render icon when not provided', () => {
			render(<Input placeholder="no icon" />);

			const icon = document.querySelector('svg');
			expect(icon).not.toBeInTheDocument();
		});

		it('applies left padding when icon is present', () => {
			render(<Input icon={Search} placeholder="search" />);

			const input = screen.getByPlaceholderText('search');
			expect(input.className).toContain('pl-9');
		});

		it('does not apply left padding when icon is absent', () => {
			render(<Input placeholder="no icon" />);

			const input = screen.getByPlaceholderText('no icon');
			expect(input.className).not.toContain('pl-9');
		});

		it('icon has pointer-events-none', () => {
			render(<Input icon={Search} placeholder="search" />);

			const icon = document.querySelector('svg');
			expect(icon?.getAttribute('class')).toContain('pointer-events-none');
		});
	});

	describe('error state', () => {
		it('shows error message text when error prop provided', () => {
			render(<Input error="Name is required" placeholder="name" />);

			expect(screen.getByText('Name is required')).toBeInTheDocument();
		});

		it('error message has role="alert"', () => {
			render(<Input error="Name is required" placeholder="name" />);

			expect(screen.getByRole('alert')).toHaveTextContent('Name is required');
		});

		it('input has aria-invalid="true" when error present', () => {
			render(<Input error="Name is required" placeholder="name" />);

			expect(screen.getByPlaceholderText('name')).toHaveAttribute('aria-invalid', 'true');
		});

		it('input has aria-describedby pointing to error message', () => {
			render(<Input error="Name is required" placeholder="name" />);

			const input = screen.getByPlaceholderText('name');
			const errorId = input.getAttribute('aria-describedby');
			expect(errorId).toBeTruthy();
			expect(document.getElementById(errorId!)).toHaveTextContent('Name is required');
		});

		it('applies border-danger class when error present', () => {
			render(<Input error="Name is required" placeholder="name" />);

			const input = screen.getByPlaceholderText('name');
			expect(input.className).toContain('border-danger');
		});

		it('no error attributes/message when error is undefined', () => {
			render(<Input placeholder="name" />);

			expect(screen.queryByRole('alert')).not.toBeInTheDocument();
			expect(screen.getByPlaceholderText('name')).not.toHaveAttribute('aria-invalid');
			expect(screen.getByPlaceholderText('name')).not.toHaveAttribute('aria-describedby');
		});

		it('empty string error treated as no error', () => {
			render(<Input error="" placeholder="name" />);

			expect(screen.queryByRole('alert')).not.toBeInTheDocument();
			expect(screen.getByPlaceholderText('name')).not.toHaveAttribute('aria-invalid');
		});

		it('icon and error compose correctly together', () => {
			render(<Input icon={Search} error="Required" placeholder="search" />);

			expect(document.querySelector('svg')).toBeInTheDocument();
			expect(screen.getByRole('alert')).toHaveTextContent('Required');
			expect(screen.getByPlaceholderText('search').className).toContain('pl-9');
			expect(screen.getByPlaceholderText('search').className).toContain('border-danger');
		});
	});

	describe('customization', () => {
		it('merges custom className', () => {
			render(<Input className="ml-2" placeholder="custom" />);

			const input = screen.getByPlaceholderText('custom');
			expect(input.className).toContain('ml-2');
			expect(input.className).toContain('w-full');
		});

		it('passes through HTML attributes', () => {
			render(<Input data-testid="my-input" placeholder="attrs" maxLength={50} />);

			const input = screen.getByTestId('my-input');
			expect(input).toHaveAttribute('maxlength', '50');
		});

		it('supports disabled state', () => {
			render(<Input disabled placeholder="disabled" />);

			const input = screen.getByPlaceholderText('disabled');
			expect(input).toBeDisabled();
			expect(input.className).toContain('disabled:cursor-not-allowed');
			expect(input.className).toContain('disabled:opacity-50');
		});

		it('forwards onChange handler', async () => {
			const user = userEvent.setup();
			const handleChange = vi.fn();

			render(<Input onChange={handleChange} placeholder="change" />);

			await user.type(screen.getByPlaceholderText('change'), 'a');
			expect(handleChange).toHaveBeenCalledTimes(1);
		});
	});

	describe('pattern validation', () => {
		it('blocks invalid characters when pattern is provided', async () => {
			const user = userEvent.setup();
			const handleChange = vi.fn();
			const numericPattern = /^[0-9]*$/;

			render(<Input pattern={numericPattern} onChange={handleChange} placeholder="numbers" />);

			const input = screen.getByPlaceholderText('numbers');

			// Try typing invalid character 'a'
			await user.type(input, 'a');

			// onChange is called but value is filtered to empty
			expect(handleChange).toHaveBeenCalled();
			expect((input as HTMLInputElement).value).toBe('');
		});

		it('allows valid characters when pattern is provided', async () => {
			const user = userEvent.setup();
			const handleChange = vi.fn();
			const numericPattern = /^[0-9]*$/;

			render(<Input pattern={numericPattern} onChange={handleChange} placeholder="numbers" />);

			const input = screen.getByPlaceholderText('numbers');

			// Type valid numeric character
			await user.type(input, '5');

			// Character should be accepted
			expect(handleChange).toHaveBeenCalled();
			expect((input as HTMLInputElement).value).toBe('5');
		});

		it('allows all characters when no pattern is provided', async () => {
			const user = userEvent.setup();
			const handleChange = vi.fn();

			render(<Input onChange={handleChange} placeholder="text" />);

			const input = screen.getByPlaceholderText('text');

			// Type various characters
			await user.type(input, 'abc123!@#');

			// All characters should be accepted
			expect(handleChange).toHaveBeenCalledTimes(9);
			expect((input as HTMLInputElement).value).toBe('abc123!@#');
		});

		it('blocks multiple consecutive invalid characters', async () => {
			const user = userEvent.setup();
			const handleChange = vi.fn();
			const numericPattern = /^[0-9]*$/;

			render(<Input pattern={numericPattern} onChange={handleChange} placeholder="numbers" />);

			const input = screen.getByPlaceholderText('numbers');

			// Try typing multiple invalid characters
			await user.type(input, 'abc');

			// onChange called for each character but all filtered to empty
			expect(handleChange).toHaveBeenCalledTimes(3);
			expect((input as HTMLInputElement).value).toBe('');
		});

		it('allows mix of valid and invalid by blocking only invalid', async () => {
			const user = userEvent.setup();
			const handleChange = vi.fn();
			const numericPattern = /^[0-9]*$/;

			render(<Input pattern={numericPattern} onChange={handleChange} placeholder="numbers" />);

			const input = screen.getByPlaceholderText('numbers');

			// Type valid characters
			await user.type(input, '123');
			expect((input as HTMLInputElement).value).toBe('123');

			// Try typing invalid character
			await user.type(input, 'a');

			// Only valid characters should remain
			expect((input as HTMLInputElement).value).toBe('123');
		});

		it('filters pasted content according to pattern', async () => {
			const user = userEvent.setup();
			const numericPattern = /^[0-9]*$/;

			render(<Input pattern={numericPattern} placeholder="numbers" />);

			const input = screen.getByPlaceholderText('numbers');

			// Type individual characters to simulate mixed input
			// (userEvent.paste doesn't trigger onChange in jsdom the same way)
			await user.type(input, '1');
			await user.type(input, '2');
			await user.type(input, '3');
			await user.type(input, 'a'); // This will be filtered
			await user.type(input, '4');
			await user.type(input, '5');
			await user.type(input, '6');

			// Only numeric characters should remain
			expect((input as HTMLInputElement).value).toBe('123456');
		});

		it('blocks entirely invalid paste content', async () => {
			const user = userEvent.setup();
			const numericPattern = /^[0-9]*$/;

			render(<Input pattern={numericPattern} placeholder="numbers" />);

			const input = screen.getByPlaceholderText('numbers');

			// Simulate paste event with entirely invalid content
			input.focus();
			await user.paste('abcdef');

			// No characters should be pasted
			expect((input as HTMLInputElement).value).toBe('');
		});

		it('validates comma-separated numbers pattern', async () => {
			const user = userEvent.setup();
			const commaSeparatedNumbers = /^[0-9,\s]*$/;

			render(<Input pattern={commaSeparatedNumbers} placeholder="csv-numbers" />);

			const input = screen.getByPlaceholderText('csv-numbers');

			// Type valid comma-separated numbers
			await user.type(input, '1, 2, 3');
			expect((input as HTMLInputElement).value).toBe('1, 2, 3');

			// Try typing invalid character
			await user.type(input, 'a');
			expect((input as HTMLInputElement).value).toBe('1, 2, 3');
		});

		it('validates comma-separated strings pattern', async () => {
			const user = userEvent.setup();
			const commaSeparatedStrings = /^[a-zA-Z0-9,\s]*$/;

			render(<Input pattern={commaSeparatedStrings} placeholder="csv-strings" />);

			const input = screen.getByPlaceholderText('csv-strings');

			// Type valid comma-separated strings
			await user.type(input, 'foo, bar, 123');
			expect((input as HTMLInputElement).value).toBe('foo, bar, 123');

			// Try typing special character
			await user.type(input, '@');
			expect((input as HTMLInputElement).value).toBe('foo, bar, 123');
		});
	});

	describe('structural pattern validation', () => {
		it('blocks invalid sequences even when individual characters are valid', async () => {
			const user = userEvent.setup();
			// Structural pattern for comma-separated numbers
			// Blocks: --, .., .- (invalid sequences)
			// Allows: -, ., digits, commas, spaces (valid individual chars and structures)
			const structuralPattern = /^(\s*-?\d*\.?\d*\s*,)*\s*-?\d*\.?\d*\s*$/;

			render(<Input pattern={structuralPattern} placeholder="structural" />);

			const input = screen.getByPlaceholderText('structural');

			// Type valid number
			await user.type(input, '1');
			expect((input as HTMLInputElement).value).toBe('1');

			// Try typing double minus - should be blocked
			await user.type(input, ', --');
			expect((input as HTMLInputElement).value).not.toContain('--');
			expect((input as HTMLInputElement).value).toBe('1, -');
		});

		it('blocks double decimal points in structural pattern', async () => {
			const user = userEvent.setup();
			const structuralPattern = /^(\s*-?\d*\.?\d*\s*,)*\s*-?\d*\.?\d*\s*$/;

			render(<Input pattern={structuralPattern} placeholder="structural" />);

			const input = screen.getByPlaceholderText('structural');

			// Try typing double decimal
			await user.type(input, '3..');
			expect((input as HTMLInputElement).value).not.toContain('..');
			expect((input as HTMLInputElement).value).toBe('3.');
		});

		it('blocks decimal followed by minus in structural pattern', async () => {
			const user = userEvent.setup();
			const structuralPattern = /^(\s*-?\d*\.?\d*\s*,)*\s*-?\d*\.?\d*\s*$/;

			render(<Input pattern={structuralPattern} placeholder="structural" />);

			const input = screen.getByPlaceholderText('structural');

			// Try typing decimal followed by minus
			await user.type(input, '5.-');
			expect((input as HTMLInputElement).value).not.toContain('.-');
			expect((input as HTMLInputElement).value).toBe('5.');
		});

		it('allows valid intermediate typing states with structural pattern', async () => {
			const user = userEvent.setup();
			const structuralPattern = /^(\s*-?\d*\.?\d*\s*,)*\s*-?\d*\.?\d*\s*$/;

			render(<Input pattern={structuralPattern} placeholder="structural" />);

			const input = screen.getByPlaceholderText('structural');

			// Allow just minus (typing -5)
			await user.type(input, '-');
			expect((input as HTMLInputElement).value).toBe('-');

			// Clear and try decimal (typing .5)
			await user.clear(input);
			await user.type(input, '.');
			expect((input as HTMLInputElement).value).toBe('.');

			// Clear and try minus-decimal (typing -.5)
			await user.clear(input);
			await user.type(input, '-.');
			expect((input as HTMLInputElement).value).toBe('-.');
		});

		it('prevents change entirely when filtered value still invalid', async () => {
			const user = userEvent.setup();
			const handleChange = vi.fn();
			const structuralPattern = /^(\s*-?\d*\.?\d*\s*,)*\s*-?\d*\.?\d*\s*$/;

			render(
				<Input pattern={structuralPattern} onChange={handleChange} placeholder="structural" />
			);

			const input = screen.getByPlaceholderText('structural');

			// Type valid start
			await user.type(input, '1');
			expect((input as HTMLInputElement).value).toBe('1');
			const callCountBefore = handleChange.mock.calls.length;

			// Try typing invalid sequence (minus after number - pattern requires minus BEFORE digits)
			await user.type(input, '-');

			// "1-" doesn't match pattern (minus must come before digits, not after)
			// Individual chars "-" and "1" both match pattern, but "1-" doesn't
			// So value reverts to last valid state which was "1"
			expect((input as HTMLInputElement).value).toBe('1');

			// onChange not called because change was blocked
			expect(handleChange.mock.calls.length).toBe(callCountBefore);
		});
	});
});
