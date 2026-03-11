import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pencil } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';

import { ButtonIcon } from './ButtonIcon';

describe('ButtonIcon', () => {
	describe('rendering', () => {
		it('renders with aria-label', () => {
			render(<ButtonIcon icon={Pencil} aria-label="Edit" />);

			expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
		});

		it('renders icon with aria-hidden', () => {
			render(<ButtonIcon icon={Pencil} aria-label="Edit" />);

			const icon = document.querySelector('svg');
			expect(icon).toBeInTheDocument();
			expect(icon).toHaveAttribute('aria-hidden', 'true');
		});

		it('defaults to type="button"', () => {
			render(<ButtonIcon icon={Pencil} aria-label="Edit" />);

			const button = screen.getByRole('button', { name: 'Edit' });
			expect(button).toHaveAttribute('type', 'button');
		});

		it('applies base classes by default', () => {
			render(<ButtonIcon icon={Pencil} aria-label="Edit" />);

			const button = screen.getByRole('button', { name: 'Edit' });
			expect(button.className).toContain('inline-flex');
			expect(button.className).toContain('items-center');
			expect(button.className).toContain('justify-center');
			expect(button.className).toContain('rounded-sm');
		});
	});

	describe('variant axis', () => {
		it.each([
			{
				variant: 'default' as const,
				expected: ['border', 'bg-transparent', 'text-text-primary'],
			},
			{
				variant: 'secondary' as const,
				expected: ['border', 'bg-bg-secondary', 'text-text-primary'],
			},
			{
				variant: 'destructive' as const,
				expected: ['border', 'bg-transparent', 'text-text-primary'],
			},
			{
				variant: 'ghost' as const,
				expected: ['bg-transparent', 'text-text-secondary'],
			},
		])('applies correct classes for variant=$variant', ({ variant, expected }) => {
			render(<ButtonIcon icon={Pencil} aria-label={variant} variant={variant} />);

			const button = screen.getByRole('button', { name: variant });
			for (const cls of expected) {
				expect(button.className).toContain(cls);
			}
		});
	});

	describe('size axis', () => {
		it.each([
			{ size: 'sm' as const, expected: ['h-7', 'w-7'] },
			{ size: 'md' as const, expected: ['h-8', 'w-8'] },
			{ size: 'lg' as const, expected: ['h-9', 'w-9'] },
		])('applies correct classes for size=$size', ({ size, expected }) => {
			render(<ButtonIcon icon={Pencil} aria-label={size} size={size} />);

			const button = screen.getByRole('button', { name: size });
			for (const cls of expected) {
				expect(button.className).toContain(cls);
			}
		});

		it('renders smaller icon for sm size', () => {
			render(<ButtonIcon icon={Pencil} aria-label="Small" size="sm" />);

			const icon = document.querySelector('svg');
			expect(icon?.getAttribute('class')).toContain('h-3.5');
			expect(icon?.getAttribute('class')).toContain('w-3.5');
		});

		it('renders standard icon for md size', () => {
			render(<ButtonIcon icon={Pencil} aria-label="Medium" size="md" />);

			const icon = document.querySelector('svg');
			expect(icon?.getAttribute('class')).toContain('h-4');
			expect(icon?.getAttribute('class')).toContain('w-4');
		});
	});

	describe('interaction', () => {
		it('calls onClick when clicked', async () => {
			const user = userEvent.setup();
			const handleClick = vi.fn();

			render(<ButtonIcon icon={Pencil} aria-label="Edit" onClick={handleClick} />);

			await user.click(screen.getByRole('button', { name: 'Edit' }));
			expect(handleClick).toHaveBeenCalledTimes(1);
		});

		it('does not call onClick when disabled', async () => {
			const user = userEvent.setup();
			const handleClick = vi.fn();

			render(<ButtonIcon icon={Pencil} aria-label="Edit" disabled onClick={handleClick} />);

			await user.click(screen.getByRole('button', { name: 'Edit' }));
			expect(handleClick).not.toHaveBeenCalled();
		});
	});

	describe('customization', () => {
		it('merges custom className', () => {
			render(<ButtonIcon icon={Pencil} aria-label="Edit" className="ml-2" />);

			const button = screen.getByRole('button', { name: 'Edit' });
			expect(button.className).toContain('ml-2');
			expect(button.className).toContain('inline-flex');
		});

		it('passes through HTML attributes', () => {
			render(<ButtonIcon icon={Pencil} aria-label="Edit" data-testid="my-btn" title="tooltip" />);

			const button = screen.getByTestId('my-btn');
			expect(button).toHaveAttribute('title', 'tooltip');
		});
	});
});
