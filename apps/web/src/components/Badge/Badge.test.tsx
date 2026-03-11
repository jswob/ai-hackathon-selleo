import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Badge } from './Badge';

describe('Badge', () => {
	describe('rendering', () => {
		it('renders children text', () => {
			render(<Badge>Active</Badge>);

			expect(screen.getByText('Active')).toBeInTheDocument();
		});

		it('renders as a span element', () => {
			render(<Badge>Status</Badge>);

			const badge = screen.getByText('Status');
			expect(badge.tagName).toBe('SPAN');
		});

		it('applies base classes by default', () => {
			render(<Badge>Default</Badge>);

			const badge = screen.getByText('Default');
			expect(badge.className).toContain('inline-flex');
			expect(badge.className).toContain('items-center');
			expect(badge.className).toContain('rounded-md');
			expect(badge.className).toContain('px-2');
			expect(badge.className).toContain('text-xs');
			expect(badge.className).toContain('font-medium');
		});
	});

	describe('variant axis', () => {
		it('applies basic variant classes for a given color', () => {
			render(
				<Badge variant="basic" color="primary">
					Basic
				</Badge>
			);

			const badge = screen.getByText('Basic');
			expect(badge.className).toContain('bg-primary/15');
			expect(badge.className).toContain('text-primary');
			expect(badge.className).not.toContain('border');
		});

		it('applies outline variant classes for a given color', () => {
			render(
				<Badge variant="outline" color="primary">
					Outline
				</Badge>
			);

			const badge = screen.getByText('Outline');
			expect(badge.className).toContain('border');
			expect(badge.className).toContain('border-primary/40');
			expect(badge.className).toContain('text-primary');
			expect(badge.className).not.toContain('bg-primary/15');
		});
	});

	describe('color axis (basic variant)', () => {
		it.each([
			{ color: 'primary' as const, bg: 'bg-primary/15', text: 'text-primary' },
			{ color: 'danger' as const, bg: 'bg-danger/15', text: 'text-danger' },
			{ color: 'success' as const, bg: 'bg-success/15', text: 'text-success' },
			{ color: 'warning' as const, bg: 'bg-warning/15', text: 'text-warning' },
			{ color: 'purple' as const, bg: 'bg-purple/15', text: 'text-purple' },
			{ color: 'teal' as const, bg: 'bg-teal/15', text: 'text-teal' },
			{ color: 'rose' as const, bg: 'bg-rose/15', text: 'text-rose' },
			{ color: 'amber' as const, bg: 'bg-amber/15', text: 'text-amber' },
			{ color: 'blue' as const, bg: 'bg-blue/15', text: 'text-blue' },
			{ color: 'lime' as const, bg: 'bg-lime/15', text: 'text-lime' },
			{ color: 'cyan' as const, bg: 'bg-cyan/15', text: 'text-cyan' },
			{ color: 'orange' as const, bg: 'bg-orange/15', text: 'text-orange' },
			{ color: 'neutral' as const, bg: 'bg-text-secondary/10', text: 'text-text-secondary' },
		])('applies correct classes for $color', ({ color, bg, text }) => {
			render(
				<Badge variant="basic" color={color}>
					{color}
				</Badge>
			);

			const badge = screen.getByText(color);
			expect(badge.className).toContain(bg);
			expect(badge.className).toContain(text);
		});
	});

	describe('color axis (outline variant)', () => {
		it.each([
			{ color: 'primary' as const, border: 'border-primary/40', text: 'text-primary' },
			{ color: 'danger' as const, border: 'border-danger/40', text: 'text-danger' },
			{ color: 'success' as const, border: 'border-success/40', text: 'text-success' },
			{ color: 'warning' as const, border: 'border-warning/40', text: 'text-warning' },
			{ color: 'purple' as const, border: 'border-purple/40', text: 'text-purple' },
			{ color: 'teal' as const, border: 'border-teal/40', text: 'text-teal' },
			{ color: 'rose' as const, border: 'border-rose/40', text: 'text-rose' },
			{ color: 'amber' as const, border: 'border-amber/40', text: 'text-amber' },
			{ color: 'blue' as const, border: 'border-blue/40', text: 'text-blue' },
			{ color: 'lime' as const, border: 'border-lime/40', text: 'text-lime' },
			{ color: 'cyan' as const, border: 'border-cyan/40', text: 'text-cyan' },
			{ color: 'orange' as const, border: 'border-orange/40', text: 'text-orange' },
			{
				color: 'neutral' as const,
				border: 'border-border-secondary',
				text: 'text-text-secondary',
			},
		])('applies correct classes for $color', ({ color, border, text }) => {
			render(
				<Badge variant="outline" color={color}>
					{color}
				</Badge>
			);

			const badge = screen.getByText(color);
			expect(badge.className).toContain('border');
			expect(badge.className).toContain(border);
			expect(badge.className).toContain(text);
		});
	});

	describe('customization', () => {
		it('merges custom className', () => {
			render(<Badge className="ml-2">Custom</Badge>);

			const badge = screen.getByText('Custom');
			expect(badge.className).toContain('ml-2');
			expect(badge.className).toContain('inline-flex');
		});

		it('passes through HTML attributes', () => {
			render(
				<Badge data-testid="my-badge" title="tooltip">
					Attrs
				</Badge>
			);

			const badge = screen.getByTestId('my-badge');
			expect(badge).toHaveAttribute('title', 'tooltip');
		});

		it('allows twMerge to override base classes', () => {
			render(<Badge className="rounded-full">Pill</Badge>);

			const badge = screen.getByText('Pill');
			expect(badge.className).toContain('rounded-full');
			expect(badge.className).not.toContain('rounded-md');
		});
	});
});
