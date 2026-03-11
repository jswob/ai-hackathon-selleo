import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CheckboxInput } from './CheckboxInput';

describe('CheckboxInput', () => {
	describe('rendering', () => {
		it('renders a button with role="checkbox"', () => {
			render(<CheckboxInput value={null} onChange={vi.fn()} />);

			expect(screen.getByRole('checkbox')).toBeInTheDocument();
			expect(screen.getByRole('checkbox').tagName).toBe('BUTTON');
		});

		it('renders check icon when value is "true"', () => {
			render(<CheckboxInput value="true" onChange={vi.fn()} />);

			expect(screen.getByTestId('check-icon')).toBeInTheDocument();
		});

		it('renders x icon when value is "false"', () => {
			render(<CheckboxInput value="false" onChange={vi.fn()} />);

			expect(screen.getByTestId('x-icon')).toBeInTheDocument();
		});

		it('renders x icon when value is null', () => {
			render(<CheckboxInput value={null} onChange={vi.fn()} />);

			expect(screen.getByTestId('x-icon')).toBeInTheDocument();
		});
	});

	describe('size variants', () => {
		it.each([
			{ size: 'sm' as const, expected: 'h-8' },
			{ size: 'md' as const, expected: 'h-9' },
		])('applies $expected class for size=$size', ({ size, expected }) => {
			render(<CheckboxInput value={null} onChange={vi.fn()} size={size} />);

			expect(screen.getByRole('checkbox').className).toContain(expected);
		});

		it('defaults to md size', () => {
			render(<CheckboxInput value={null} onChange={vi.fn()} />);

			expect(screen.getByRole('checkbox').className).toContain('h-9');
		});
	});

	describe('state styling', () => {
		it('applies checked styles when value is "true"', () => {
			render(<CheckboxInput value="true" onChange={vi.fn()} />);

			const checkbox = screen.getByRole('checkbox');
			expect(checkbox.className).toContain('bg-primary');
			expect(checkbox.className).toContain('text-white');
			expect(checkbox.className).toContain('border-primary');
		});

		it('applies unchecked styles when value is not "true"', () => {
			render(<CheckboxInput value={null} onChange={vi.fn()} />);

			const checkbox = screen.getByRole('checkbox');
			expect(checkbox.className).toContain('bg-bg-secondary');
			expect(checkbox.className).toContain('text-text-primary');
			expect(checkbox.className).toContain('border-border-primary');
		});
	});

	describe('interaction', () => {
		it('calls onChange with "true" when clicked with null value', async () => {
			const user = userEvent.setup();
			const handleChange = vi.fn();

			render(<CheckboxInput value={null} onChange={handleChange} />);

			await user.click(screen.getByRole('checkbox'));

			expect(handleChange).toHaveBeenCalledWith('true');
		});

		it('calls onChange with "false" when clicked with "true" value', async () => {
			const user = userEvent.setup();
			const handleChange = vi.fn();

			render(<CheckboxInput value="true" onChange={handleChange} />);

			await user.click(screen.getByRole('checkbox'));

			expect(handleChange).toHaveBeenCalledWith('false');
		});

		it('calls onChange with "true" when clicked with "false" value', async () => {
			const user = userEvent.setup();
			const handleChange = vi.fn();

			render(<CheckboxInput value="false" onChange={handleChange} />);

			await user.click(screen.getByRole('checkbox'));

			expect(handleChange).toHaveBeenCalledWith('true');
		});

		it('does not call onChange when disabled', async () => {
			const user = userEvent.setup();
			const handleChange = vi.fn();

			render(<CheckboxInput value="false" onChange={handleChange} disabled />);

			await user.click(screen.getByRole('checkbox'));

			expect(handleChange).not.toHaveBeenCalled();
		});
	});

	describe('accessibility', () => {
		it('sets aria-checked="true" when value is "true"', () => {
			render(<CheckboxInput value="true" onChange={vi.fn()} />);

			expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
		});

		it('sets aria-checked="false" when value is not "true"', () => {
			render(<CheckboxInput value={null} onChange={vi.fn()} />);

			expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'false');
		});

		it('sets aria-checked="false" when value is "false"', () => {
			render(<CheckboxInput value="false" onChange={vi.fn()} />);

			expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'false');
		});
	});

	describe('customization', () => {
		it('merges custom className', () => {
			render(<CheckboxInput value={null} onChange={vi.fn()} className="ml-4" />);

			const checkbox = screen.getByRole('checkbox');
			expect(checkbox.className).toContain('ml-4');
			expect(checkbox.className).toContain('border');
		});

		it('allows twMerge to override base classes', () => {
			render(<CheckboxInput value={null} onChange={vi.fn()} className="h-12" />);

			const checkbox = screen.getByRole('checkbox');
			expect(checkbox.className).toContain('h-12');
			expect(checkbox.className).not.toContain('h-9');
		});

		it('passes through extra button attributes', () => {
			render(<CheckboxInput value={null} onChange={vi.fn()} data-testid="custom-cb" />);

			expect(screen.getByTestId('custom-cb')).toBeInTheDocument();
		});
	});
});
