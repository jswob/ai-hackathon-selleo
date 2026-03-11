import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
	it('renders children', () => {
		render(
			<Tooltip content="Hint">
				<button type="button">Hover me</button>
			</Tooltip>
		);

		expect(screen.getByText('Hover me')).toBeInTheDocument();
	});

	it('shows tooltip content on hover', async () => {
		const user = userEvent.setup();
		render(
			<Tooltip content="Hint text">
				<button type="button">Hover me</button>
			</Tooltip>
		);

		await user.hover(screen.getByText('Hover me'));

		await waitFor(() => {
			expect(screen.getByRole('tooltip')).toHaveTextContent('Hint text');
		});
	});

	it('hides tooltip on unhover', async () => {
		const user = userEvent.setup();
		render(
			<Tooltip content="Hint text">
				<button type="button">Hover me</button>
			</Tooltip>
		);

		await user.hover(screen.getByText('Hover me'));
		await waitFor(() => {
			expect(screen.getByRole('tooltip')).toBeInTheDocument();
		});

		await user.unhover(screen.getByText('Hover me'));
		await waitFor(() => {
			expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
		});
	});

	it('renders ReactNode content', async () => {
		const user = userEvent.setup();
		render(
			<Tooltip
				content={
					<span>
						<strong>Bold</strong> text
					</span>
				}
			>
				<button type="button">Hover me</button>
			</Tooltip>
		);

		await user.hover(screen.getByText('Hover me'));

		await waitFor(() => {
			expect(screen.getByRole('tooltip')).toContainHTML('<strong>Bold</strong>');
		});
	});

	it('applies custom className', async () => {
		const user = userEvent.setup();
		render(
			<Tooltip content="Hint" className="custom-class">
				<button type="button">Hover me</button>
			</Tooltip>
		);

		await user.hover(screen.getByText('Hover me'));

		await waitFor(() => {
			expect(screen.getByRole('tooltip')).toHaveClass('custom-class');
		});
	});

	it('has role="tooltip" on the tooltip element', async () => {
		const user = userEvent.setup();
		render(
			<Tooltip content="Hint">
				<button type="button">Hover me</button>
			</Tooltip>
		);

		await user.hover(screen.getByText('Hover me'));

		await waitFor(() => {
			expect(screen.getByRole('tooltip')).toBeInTheDocument();
		});
	});
});
