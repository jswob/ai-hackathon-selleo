import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Toggle } from './Toggle';

describe('Toggle', () => {
	describe('rendering', () => {
		it('renders with role="switch"', () => {
			render(<Toggle checked={false} onChange={vi.fn()} />);

			expect(screen.getByRole('switch')).toBeInTheDocument();
		});

		it('applies aria-label to switch element', () => {
			render(<Toggle checked={false} onChange={vi.fn()} aria-label="Enable rule" />);

			expect(screen.getByRole('switch')).toHaveAttribute('aria-label', 'Enable rule');
		});
	});

	describe('size variants', () => {
		it('applies h-5 class for size=sm', () => {
			render(<Toggle checked={false} onChange={vi.fn()} size="sm" />);

			expect(screen.getByRole('switch').className).toContain('h-5');
		});

		it('applies h-6 class for size=md', () => {
			render(<Toggle checked={false} onChange={vi.fn()} size="md" />);

			expect(screen.getByRole('switch').className).toContain('h-6');
		});

		it('defaults to md size', () => {
			render(<Toggle checked={false} onChange={vi.fn()} />);

			expect(screen.getByRole('switch').className).toContain('h-6');
		});
	});

	describe('state styling', () => {
		it('applies bg-primary when checked', () => {
			render(<Toggle checked={true} onChange={vi.fn()} />);

			expect(screen.getByRole('switch').className).toContain('bg-primary');
		});

		it('applies bg-border-primary when unchecked', () => {
			render(<Toggle checked={false} onChange={vi.fn()} />);

			expect(screen.getByRole('switch').className).toContain('bg-border-primary');
		});

		it('translates knob when checked', () => {
			const { container } = render(<Toggle checked={true} onChange={vi.fn()} />);

			const knob = container.querySelector('[aria-hidden="true"]');
			expect(knob?.className).toContain('translate-x-5');
		});

		it('does not translate knob when unchecked', () => {
			const { container } = render(<Toggle checked={false} onChange={vi.fn()} />);

			const knob = container.querySelector('[aria-hidden="true"]');
			expect(knob?.className).toContain('translate-x-0');
		});
	});

	describe('interaction', () => {
		it('calls onChange with true when clicking unchecked toggle', async () => {
			const user = userEvent.setup();
			const handleChange = vi.fn();

			render(<Toggle checked={false} onChange={handleChange} />);

			await user.click(screen.getByRole('switch'));

			expect(handleChange).toHaveBeenCalledWith(true);
		});

		it('calls onChange with false when clicking checked toggle', async () => {
			const user = userEvent.setup();
			const handleChange = vi.fn();

			render(<Toggle checked={true} onChange={handleChange} />);

			await user.click(screen.getByRole('switch'));

			expect(handleChange).toHaveBeenCalledWith(false);
		});

		it('does not call onChange when disabled', async () => {
			const user = userEvent.setup();
			const handleChange = vi.fn();

			render(<Toggle checked={false} onChange={handleChange} disabled />);

			await user.click(screen.getByRole('switch'));

			expect(handleChange).not.toHaveBeenCalled();
		});
	});

	describe('accessibility', () => {
		it('sets aria-checked="true" when checked', () => {
			render(<Toggle checked={true} onChange={vi.fn()} />);

			expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
		});

		it('sets aria-checked="false" when unchecked', () => {
			render(<Toggle checked={false} onChange={vi.fn()} />);

			expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
		});

		it('applies custom aria-label', () => {
			render(<Toggle checked={false} onChange={vi.fn()} aria-label="Enable notifications" />);

			expect(screen.getByRole('switch')).toHaveAttribute('aria-label', 'Enable notifications');
		});

		it('has disabled attribute when disabled', () => {
			render(<Toggle checked={false} onChange={vi.fn()} disabled />);

			expect(screen.getByRole('switch')).toBeDisabled();
		});
	});
});
