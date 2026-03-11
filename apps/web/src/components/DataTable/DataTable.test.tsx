import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { DataTable } from './DataTable';
import type { ColumnDef } from './types';

interface TestRow {
	id: number;
	name: string;
	age: number;
}

const columns: ColumnDef<TestRow>[] = [
	{ id: 'name', header: 'Name', cell: 'name' },
	{ id: 'age', header: 'Age', cell: 'age' },
];

const testData: TestRow[] = [
	{ id: 1, name: 'Alice', age: 30 },
	{ id: 2, name: 'Bob', age: 25 },
	{ id: 3, name: 'Charlie', age: 35 },
];

const getRowKey = (row: TestRow) => row.id;

describe('DataTable', () => {
	it('renders column headers', () => {
		render(<DataTable columns={columns} data={testData} getRowKey={getRowKey} />);

		expect(screen.getByText('Name')).toBeInTheDocument();
		expect(screen.getByText('Age')).toBeInTheDocument();
	});

	it('renders data rows with correct values', () => {
		render(<DataTable columns={columns} data={testData} getRowKey={getRowKey} />);

		expect(screen.getByText('Alice')).toBeInTheDocument();
		expect(screen.getByText('30')).toBeInTheDocument();
		expect(screen.getByText('Bob')).toBeInTheDocument();
		expect(screen.getByText('25')).toBeInTheDocument();
	});

	it('renders custom cell render functions', () => {
		const customColumns: ColumnDef<TestRow>[] = [
			{ id: 'name', header: 'Name', cell: row => <strong>{row.name}</strong> },
		];

		render(<DataTable columns={customColumns} data={testData} getRowKey={getRowKey} />);

		const strong = screen.getByText('Alice');
		expect(strong.tagName).toBe('STRONG');
	});

	it('renders colgroup with proportional widths based on grow', () => {
		const growColumns: ColumnDef<TestRow>[] = [
			{ id: 'name', header: 'Name', cell: 'name', grow: 2 },
			{ id: 'age', header: 'Age', cell: 'age', grow: 1 },
		];

		const { container } = render(
			<DataTable columns={growColumns} data={testData} getRowKey={getRowKey} />
		);

		const cols = container.querySelectorAll('colgroup col');
		expect(cols).toHaveLength(2);
		// grow 2 out of total 3 => ~66.67%
		expect((cols[0] as HTMLElement).style.width).toMatch(/66\.6/);
		// grow 1 out of total 3 => ~33.33%
		expect((cols[1] as HTMLElement).style.width).toMatch(/33\.3/);
	});

	it('defaults grow to 1 when not specified', () => {
		const { container } = render(
			<DataTable columns={columns} data={testData} getRowKey={getRowKey} />
		);

		const cols = container.querySelectorAll('colgroup col');
		expect(cols).toHaveLength(2);
		// Both default grow=1, total=2, each should be 50%
		expect((cols[0] as HTMLElement).style.width).toBe('50%');
		expect((cols[1] as HTMLElement).style.width).toBe('50%');
	});

	it('renders actions defined as a regular column with cell render function', async () => {
		const user = userEvent.setup();
		const onEdit = vi.fn();
		const columnsWithActions: ColumnDef<TestRow>[] = [
			{ id: 'name', header: 'Name', cell: 'name' },
			{
				id: 'actions',
				header: 'Actions',
				cell: (row: TestRow) => (
					<button
						type="button"
						onClick={() => {
							onEdit(row);
						}}
					>
						Edit
					</button>
				),
				grow: 0.5,
			},
		];

		render(<DataTable columns={columnsWithActions} data={testData} getRowKey={getRowKey} />);

		expect(screen.getByText('Actions')).toBeInTheDocument();
		const editButtons = screen.getAllByRole('button', { name: 'Edit' });
		expect(editButtons).toHaveLength(3);

		await user.click(editButtons[0]!);
		expect(onEdit).toHaveBeenCalledWith(testData[0]);
	});

	it('shows loading state', () => {
		render(<DataTable columns={columns} data={[]} getRowKey={getRowKey} isLoading />);

		expect(screen.getByText('Loading...')).toBeInTheDocument();
		expect(screen.queryByRole('table')).not.toBeInTheDocument();
	});

	it('shows error state', () => {
		render(
			<DataTable
				columns={columns}
				data={[]}
				getRowKey={getRowKey}
				error={new Error('Something went wrong')}
			/>
		);

		expect(screen.getByText('Error: Something went wrong')).toBeInTheDocument();
		expect(screen.queryByRole('table')).not.toBeInTheDocument();
	});

	it('shows empty state message', () => {
		render(
			<DataTable
				columns={columns}
				data={[]}
				getRowKey={getRowKey}
				emptyMessage="No participants found."
			/>
		);

		expect(screen.getByText('No participants found.')).toBeInTheDocument();
		expect(screen.queryByRole('table')).not.toBeInTheDocument();
	});

	it('shows default empty message when no custom message', () => {
		render(<DataTable columns={columns} data={[]} getRowKey={getRowKey} />);

		expect(screen.getByText('No data found.')).toBeInTheDocument();
	});

	it('renders pagination for data exceeding pageSize', () => {
		const manyRows = Array.from({ length: 15 }, (_unused, i) => ({
			id: i + 1,
			name: `Person ${i + 1}`,
			age: 20 + i,
		}));

		render(<DataTable columns={columns} data={manyRows} getRowKey={getRowKey} />);

		expect(screen.getByText(/Showing 1-10 of 15/)).toBeInTheDocument();
	});

	it('navigates pages and changes visible rows', async () => {
		const user = userEvent.setup();
		const manyRows = Array.from({ length: 15 }, (_unused, i) => ({
			id: i + 1,
			name: `Person ${i + 1}`,
			age: 20 + i,
		}));

		render(<DataTable columns={columns} data={manyRows} getRowKey={getRowKey} />);

		// Page 1 shows Person 1-10
		expect(screen.getByText('Person 1')).toBeInTheDocument();
		expect(screen.getByText('Person 10')).toBeInTheDocument();
		expect(screen.queryByText('Person 11')).not.toBeInTheDocument();

		// Navigate to page 2
		await user.click(screen.getByRole('button', { name: 'Page 2' }));

		expect(screen.queryByText('Person 10')).not.toBeInTheDocument();
		expect(screen.getByText('Person 11')).toBeInTheDocument();
		expect(screen.getByText('Person 15')).toBeInTheDocument();
	});

	it('navigates to first page from a later page', async () => {
		const user = userEvent.setup();
		const manyRows = Array.from({ length: 100 }, (_unused, i) => ({
			id: i + 1,
			name: `Person ${i + 1}`,
			age: 20 + i,
		}));

		render(<DataTable columns={columns} data={manyRows} getRowKey={getRowKey} />);

		// Go to page 5 (middle of range)
		await user.click(screen.getByRole('button', { name: 'Page 5' }));
		expect(screen.getByText('Person 41')).toBeInTheDocument();

		// Click first page button
		await user.click(screen.getByRole('button', { name: 'First page' }));
		expect(screen.getByText('Person 1')).toBeInTheDocument();
	});

	it('navigates to last page from an earlier page', async () => {
		const user = userEvent.setup();
		const manyRows = Array.from({ length: 100 }, (_unused, i) => ({
			id: i + 1,
			name: `Person ${i + 1}`,
			age: 20 + i,
		}));

		render(<DataTable columns={columns} data={manyRows} getRowKey={getRowKey} />);

		// Click last page button
		await user.click(screen.getByRole('button', { name: 'Last page' }));
		expect(screen.getByText('Person 100')).toBeInTheDocument();
	});

	it('does not render pagination for single page', () => {
		render(<DataTable columns={columns} data={testData} getRowKey={getRowKey} />);

		expect(screen.queryByText(/Showing/)).not.toBeInTheDocument();
	});

	it('has a scroll container wrapping the table', () => {
		const { container } = render(
			<DataTable columns={columns} data={testData} getRowKey={getRowKey} />
		);

		const scrollContainer = container.querySelector('.overflow-auto');
		expect(scrollContainer).toBeInTheDocument();
		expect(scrollContainer!.querySelector('table')).toBeInTheDocument();
	});

	it('thead has sticky classes', () => {
		const { container } = render(
			<DataTable columns={columns} data={testData} getRowKey={getRowKey} />
		);

		const thead = container.querySelector('thead');
		expect(thead!.className).toContain('sticky');
		expect(thead!.className).toContain('top-0');
		expect(thead!.className).toContain('z-10');
	});

	it('uses semantic table elements', () => {
		render(<DataTable columns={columns} data={testData} getRowKey={getRowKey} />);

		const table = screen.getByRole('table');
		expect(table).toBeInTheDocument();

		// Check th elements have scope="col"
		const headerCells = within(table).getAllByRole('columnheader');
		headerCells.forEach(th => {
			expect(th).toHaveAttribute('scope', 'col');
		});
	});

	describe('row color indicator', () => {
		const getRowColor = (row: TestRow) => (row.name === 'Alice' ? 'purple' : 'teal');

		it('does not render indicator column when getRowColor is absent', () => {
			const { container } = render(
				<DataTable columns={columns} data={testData} getRowKey={getRowKey} />
			);

			const cols = container.querySelectorAll('colgroup col');
			expect(cols).toHaveLength(2);
		});

		it('renders indicator col with 4px width when getRowColor is present', () => {
			const { container } = render(
				<DataTable
					columns={columns}
					data={testData}
					getRowKey={getRowKey}
					getRowColor={getRowColor}
				/>
			);

			const cols = container.querySelectorAll('colgroup col');
			expect(cols).toHaveLength(3);
			expect((cols[0] as HTMLElement).style.width).toBe('4px');
		});

		it('renders header th with aria-hidden and no scope', () => {
			const { container } = render(
				<DataTable
					columns={columns}
					data={testData}
					getRowKey={getRowKey}
					getRowColor={getRowColor}
				/>
			);

			const headerRow = container.querySelector('thead tr')!;
			const firstTh = headerRow.querySelector('th:first-child')!;
			expect(firstTh).toHaveAttribute('aria-hidden', 'true');
			expect(firstTh).not.toHaveAttribute('scope');
		});

		it('renders body td cells with correct backgroundColor CSS variable per row', () => {
			const { container } = render(
				<DataTable
					columns={columns}
					data={testData}
					getRowKey={getRowKey}
					getRowColor={getRowColor}
				/>
			);

			const rows = container.querySelectorAll('tbody tr');
			const firstRowIndicator = rows[0]!.querySelector('td:first-child') as HTMLElement;
			const secondRowIndicator = rows[1]!.querySelector('td:first-child') as HTMLElement;

			expect(firstRowIndicator.style.backgroundColor).toBe('var(--color-purple)');
			expect(secondRowIndicator.style.backgroundColor).toBe('var(--color-teal)');
		});

		it('renders indicator cells with p-0 class', () => {
			const { container } = render(
				<DataTable
					columns={columns}
					data={testData}
					getRowKey={getRowKey}
					getRowColor={getRowColor}
				/>
			);

			const rows = container.querySelectorAll('tbody tr');
			const indicator = rows[0]!.querySelector('td:first-child')!;
			expect(indicator.className).toContain('p-0');
		});
	});
});
