import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChevronRight, Plus } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './Button';

describe('Button', () => {
	describe('rendering', () => {
		it('renders children text', () => {
			render(<Button>Click me</Button>);

			expect(screen.getByText('Click me')).toBeInTheDocument();
		});

		it('renders as a button element', () => {
			render(<Button>Test</Button>);

			const button = screen.getByRole('button', { name: 'Test' });
			expect(button.tagName).toBe('BUTTON');
		});

		it('defaults to type="button"', () => {
			render(<Button>Test</Button>);

			const button = screen.getByRole('button', { name: 'Test' });
			expect(button).toHaveAttribute('type', 'button');
		});

		it('allows custom type attribute', () => {
			render(<Button type="submit">Submit</Button>);

			const button = screen.getByRole('button', { name: 'Submit' });
			expect(button).toHaveAttribute('type', 'submit');
		});

		it('applies base classes by default', () => {
			render(<Button>Default</Button>);

			const button = screen.getByRole('button', { name: 'Default' });
			expect(button.className).toContain('inline-flex');
			expect(button.className).toContain('items-center');
			expect(button.className).toContain('justify-center');
			expect(button.className).toContain('font-medium');
			expect(button.className).toContain('rounded-sm');
		});
	});

	describe('variant axis', () => {
		it.each([
			{
				variant: 'primary' as const,
				expected: ['bg-primary', 'text-white'],
			},
			{
				variant: 'secondary' as const,
				expected: ['bg-bg-secondary', 'text-text-primary', 'border'],
			},
			{
				variant: 'ghost' as const,
				expected: ['bg-transparent', 'text-text-secondary'],
			},
			{
				variant: 'destructive' as const,
				expected: ['bg-transparent', 'text-danger', 'border'],
			},
			{
				variant: 'dashed' as const,
				expected: ['border-dashed', 'bg-transparent', 'text-text-secondary'],
			},
		])('applies correct classes for variant=$variant', ({ variant, expected }) => {
			render(<Button variant={variant}>{variant}</Button>);

			const button = screen.getByRole('button', { name: variant });
			for (const cls of expected) {
				expect(button.className).toContain(cls);
			}
		});
	});

	describe('size axis', () => {
		it.each([
			{ size: 'sm' as const, expected: ['h-8', 'text-[13px]', 'px-3'] },
			{ size: 'md' as const, expected: ['h-9', 'text-sm', 'px-4'] },
			{ size: 'lg' as const, expected: ['h-10', 'text-sm', 'px-5'] },
		])('applies correct classes for size=$size', ({ size, expected }) => {
			render(<Button size={size}>{size}</Button>);

			const button = screen.getByRole('button', { name: size });
			for (const cls of expected) {
				expect(button.className).toContain(cls);
			}
		});
	});

	describe('icons', () => {
		it('renders leading icon', () => {
			render(<Button leadingIcon={Plus}>Add</Button>);

			const icons = document.querySelectorAll('svg');
			expect(icons).toHaveLength(1);
			expect(icons[0]).toHaveAttribute('aria-hidden', 'true');
		});

		it('renders trailing icon', () => {
			render(<Button trailingIcon={ChevronRight}>Next</Button>);

			const icons = document.querySelectorAll('svg');
			expect(icons).toHaveLength(1);
			expect(icons[0]).toHaveAttribute('aria-hidden', 'true');
		});

		it('renders both leading and trailing icons', () => {
			render(
				<Button leadingIcon={Plus} trailingIcon={ChevronRight}>
					Both
				</Button>
			);

			const icons = document.querySelectorAll('svg');
			expect(icons).toHaveLength(2);
		});
	});

	describe('interaction', () => {
		it('calls onClick when clicked', async () => {
			const user = userEvent.setup();
			const handleClick = vi.fn();

			render(<Button onClick={handleClick}>Click</Button>);

			await user.click(screen.getByRole('button', { name: 'Click' }));
			expect(handleClick).toHaveBeenCalledTimes(1);
		});

		it('does not call onClick when disabled', async () => {
			const user = userEvent.setup();
			const handleClick = vi.fn();

			render(
				<Button disabled onClick={handleClick}>
					Disabled
				</Button>
			);

			await user.click(screen.getByRole('button', { name: 'Disabled' }));
			expect(handleClick).not.toHaveBeenCalled();
		});
	});

	describe('customization', () => {
		it('merges custom className', () => {
			render(<Button className="ml-2">Custom</Button>);

			const button = screen.getByRole('button', { name: 'Custom' });
			expect(button.className).toContain('ml-2');
			expect(button.className).toContain('inline-flex');
		});

		it('passes through HTML attributes', () => {
			render(
				<Button data-testid="my-button" title="tooltip">
					Attrs
				</Button>
			);

			const button = screen.getByTestId('my-button');
			expect(button).toHaveAttribute('title', 'tooltip');
		});

		it('allows twMerge to override base classes', () => {
			render(<Button className="rounded-full">Pill</Button>);

			const button = screen.getByRole('button', { name: 'Pill' });
			expect(button.className).toContain('rounded-full');
			expect(button.className).not.toContain('rounded-sm');
		});
	});
});
