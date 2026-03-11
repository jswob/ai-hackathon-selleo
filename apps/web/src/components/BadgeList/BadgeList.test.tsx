import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { BadgeList, type BadgeItem } from './BadgeList';

const items: BadgeItem[] = [
	{ key: '1', label: 'TypeScript', color: 'purple' },
	{ key: '2', label: 'React', color: 'teal' },
	{ key: '3', label: 'Node', color: 'blue' },
	{ key: '4', label: 'Python', color: 'amber' },
	{ key: '5', label: 'Go', color: 'cyan' },
];

describe('BadgeList', () => {
	it('renders "--" when items are empty', () => {
		render(<BadgeList items={[]} />);

		expect(screen.getByText('--')).toBeInTheDocument();
	});

	it('renders all badges when count is within maxVisible', () => {
		render(<BadgeList items={items.slice(0, 3)} maxVisible={3} />);

		expect(screen.getByText('TypeScript')).toBeInTheDocument();
		expect(screen.getByText('React')).toBeInTheDocument();
		expect(screen.getByText('Node')).toBeInTheDocument();
	});

	it('renders overflow badge with "+N more" when items exceed maxVisible', () => {
		render(<BadgeList items={items} maxVisible={2} />);

		expect(screen.getByText('TypeScript')).toBeInTheDocument();
		expect(screen.getByText('React')).toBeInTheDocument();
		expect(screen.getByText('+3 more')).toBeInTheDocument();
	});

	it('does not render overflow items in the DOM', () => {
		render(<BadgeList items={items} maxVisible={2} />);

		expect(screen.queryByText('Node')).not.toBeInTheDocument();
		expect(screen.queryByText('Python')).not.toBeInTheDocument();
		expect(screen.queryByText('Go')).not.toBeInTheDocument();
	});

	it('shows overflow items in tooltip on hover', async () => {
		const user = userEvent.setup();
		render(<BadgeList items={items} maxVisible={2} />);

		await user.hover(screen.getByText('+3 more'));

		await waitFor(() => {
			const tooltip = screen.getByRole('tooltip');
			expect(tooltip).toHaveTextContent('Node');
			expect(tooltip).toHaveTextContent('Python');
			expect(tooltip).toHaveTextContent('Go');
		});
	});

	it('applies variant to badges', () => {
		render(<BadgeList items={items.slice(0, 1)} variant="outline" />);

		const badge = screen.getByText('TypeScript');
		expect(badge).toHaveClass('border');
	});

	it('uses neutral color on overflow badge', () => {
		render(<BadgeList items={items} maxVisible={2} variant="outline" />);

		const overflowBadge = screen.getByText('+3 more');
		expect(overflowBadge).toHaveClass('text-text-secondary');
	});

	it('applies correct colors to badges', () => {
		render(<BadgeList items={items.slice(0, 2)} />);

		const tsBadge = screen.getByText('TypeScript');
		const reactBadge = screen.getByText('React');
		expect(tsBadge).toHaveClass('text-purple');
		expect(reactBadge).toHaveClass('text-teal');
	});
});
