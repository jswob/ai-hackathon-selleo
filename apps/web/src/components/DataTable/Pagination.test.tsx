import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Pagination } from './Pagination';

const defaultProps = {
	currentPage: 1,
	totalPages: 5,
	startIndex: 0,
	endIndex: 10,
	totalItems: 50,
	canGoPrev: false,
	canGoNext: true,
	pageRange: [1, 2, 3, 4, 5],
	entityName: 'Participants',
	onPageChange: vi.fn(),
	onNextPage: vi.fn(),
	onPrevPage: vi.fn(),
	onFirstPage: vi.fn(),
	onLastPage: vi.fn(),
};

describe('Pagination', () => {
	it('renders info text with correct range and entity name', () => {
		render(<Pagination {...defaultProps} />);

		expect(screen.getByText('Showing 1-10 of 50 Participants')).toBeInTheDocument();
	});

	it('renders page number buttons', () => {
		render(<Pagination {...defaultProps} />);

		for (let i = 1; i <= 5; i++) {
			expect(screen.getByRole('button', { name: `Page ${i}` })).toBeInTheDocument();
		}
	});

	it('marks the active page with aria-current', () => {
		render(<Pagination {...defaultProps} currentPage={3} />);

		const activePage = screen.getByRole('button', { name: 'Page 3' });
		expect(activePage).toHaveAttribute('aria-current', 'page');

		const otherPage = screen.getByRole('button', { name: 'Page 1' });
		expect(otherPage).not.toHaveAttribute('aria-current');
	});

	it('calls onPageChange when a page button is clicked', async () => {
		const user = userEvent.setup();
		const onPageChange = vi.fn();
		render(<Pagination {...defaultProps} onPageChange={onPageChange} />);

		await user.click(screen.getByRole('button', { name: 'Page 3' }));

		expect(onPageChange).toHaveBeenCalledWith(3);
	});

	it('calls onNextPage when next button is clicked', async () => {
		const user = userEvent.setup();
		const onNextPage = vi.fn();
		render(<Pagination {...defaultProps} onNextPage={onNextPage} />);

		await user.click(screen.getByRole('button', { name: 'Next page' }));

		expect(onNextPage).toHaveBeenCalledOnce();
	});

	it('calls onPrevPage when previous button is clicked', async () => {
		const user = userEvent.setup();
		const onPrevPage = vi.fn();
		render(<Pagination {...defaultProps} canGoPrev onPrevPage={onPrevPage} />);

		await user.click(screen.getByRole('button', { name: 'Previous page' }));

		expect(onPrevPage).toHaveBeenCalledOnce();
	});

	it('disables previous button when canGoPrev is false', () => {
		render(<Pagination {...defaultProps} canGoPrev={false} />);

		expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
	});

	it('disables next button when canGoNext is false', () => {
		render(<Pagination {...defaultProps} canGoNext={false} />);

		expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
	});

	it('does not render first page button when window includes page 1', () => {
		render(<Pagination {...defaultProps} pageRange={[1, 2, 3, 4, 5]} />);

		expect(screen.queryByRole('button', { name: 'First page' })).not.toBeInTheDocument();
	});

	it('renders first page button when window does not include page 1', () => {
		render(
			<Pagination
				{...defaultProps}
				currentPage={8}
				totalPages={10}
				canGoPrev
				canGoNext
				pageRange={[6, 7, 8, 9, 10]}
			/>
		);

		expect(screen.getByRole('button', { name: 'First page' })).toBeInTheDocument();
	});

	it('calls onFirstPage when first page button is clicked', async () => {
		const user = userEvent.setup();
		const onFirstPage = vi.fn();
		render(
			<Pagination
				{...defaultProps}
				currentPage={8}
				totalPages={10}
				canGoPrev
				canGoNext
				pageRange={[6, 7, 8, 9, 10]}
				onFirstPage={onFirstPage}
			/>
		);

		await user.click(screen.getByRole('button', { name: 'First page' }));

		expect(onFirstPage).toHaveBeenCalledOnce();
	});

	it('does not render last page button when window includes last page', () => {
		render(
			<Pagination
				{...defaultProps}
				currentPage={4}
				totalPages={5}
				canGoPrev
				canGoNext
				pageRange={[1, 2, 3, 4, 5]}
			/>
		);

		expect(screen.queryByRole('button', { name: 'Last page' })).not.toBeInTheDocument();
	});

	it('renders last page button when window does not include last page', () => {
		render(
			<Pagination
				{...defaultProps}
				currentPage={3}
				totalPages={10}
				canGoPrev
				canGoNext
				pageRange={[1, 2, 3, 4, 5]}
			/>
		);

		expect(screen.getByRole('button', { name: 'Last page' })).toBeInTheDocument();
	});

	it('calls onLastPage when last page button is clicked', async () => {
		const user = userEvent.setup();
		const onLastPage = vi.fn();
		render(
			<Pagination
				{...defaultProps}
				currentPage={3}
				totalPages={10}
				canGoPrev
				canGoNext
				pageRange={[1, 2, 3, 4, 5]}
				onLastPage={onLastPage}
			/>
		);

		await user.click(screen.getByRole('button', { name: 'Last page' }));

		expect(onLastPage).toHaveBeenCalledOnce();
	});

	it('renders ellipsis before window when page 1 is not in range', () => {
		render(
			<Pagination
				{...defaultProps}
				currentPage={8}
				totalPages={10}
				canGoPrev
				canGoNext
				pageRange={[6, 7, 8, 9, 10]}
			/>
		);

		const ellipses = screen.getAllByText('...');
		expect(ellipses.length).toBeGreaterThanOrEqual(1);
	});

	it('renders ellipsis after window when last page is not in range', () => {
		render(
			<Pagination
				{...defaultProps}
				currentPage={3}
				totalPages={10}
				canGoPrev
				canGoNext
				pageRange={[1, 2, 3, 4, 5]}
			/>
		);

		const ellipses = screen.getAllByText('...');
		expect(ellipses.length).toBeGreaterThanOrEqual(1);
	});

	it('returns null when totalPages is 0', () => {
		const { container } = render(<Pagination {...defaultProps} totalPages={0} pageRange={[]} />);

		expect(container.innerHTML).toBe('');
	});

	it('returns null when totalPages is 1', () => {
		const { container } = render(<Pagination {...defaultProps} totalPages={1} pageRange={[1]} />);

		expect(container.innerHTML).toBe('');
	});
});
