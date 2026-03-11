import { cn } from '@/lib/utils';
import { Pagination } from './Pagination';
import type { DataTableProps } from './types';
import { usePagination } from './usePagination';

/** Reusable generic data table with client-side pagination and proportional column sizing. */
export function DataTable<TData>({
	columns,
	data,
	getRowKey,
	entityName = 'items',
	pageSize = 10,
	isLoading,
	error,
	emptyMessage = 'No data found.',
	getRowColor,
}: DataTableProps<TData>) {
	const pagination = usePagination({ totalItems: data.length, pageSize });
	const visibleData = data.slice(pagination.startIndex, pagination.endIndex);
	const totalGrow = columns.reduce((sum, col) => sum + (col.grow ?? 1), 0);

	if (isLoading) {
		return (
			<div className="overflow-hidden rounded-md border border-border-primary bg-bg-secondary p-4 text-sm text-text-secondary">
				Loading...
			</div>
		);
	}

	if (error) {
		return (
			<div className="overflow-hidden rounded-md border border-border-primary bg-bg-secondary p-4 text-sm text-danger">
				Error: {error.message}
			</div>
		);
	}

	if (data.length === 0) {
		return (
			<div className="overflow-hidden rounded-md border border-border-primary bg-bg-secondary p-4 text-sm text-text-secondary">
				{emptyMessage}
			</div>
		);
	}

	return (
		<div className="flex min-h-0 flex-col overflow-hidden rounded-md border border-border-primary bg-bg-secondary">
			<div className="min-h-0 overflow-auto">
				<table className="w-full" style={{ tableLayout: 'fixed' }}>
					<colgroup>
						{getRowColor && <col style={{ width: '4px' }} />}
						{columns.map(col => (
							<col key={col.id} style={{ width: `${((col.grow ?? 1) / totalGrow) * 100}%` }} />
						))}
					</colgroup>
					<thead className="sticky top-0 z-10 bg-bg-primary">
						<tr className="bg-bg-primary">
							{getRowColor && <th aria-hidden="true" />}
							{columns.map(col => (
								<th
									key={col.id}
									scope="col"
									className={cn(
										'p-4 text-left text-[13px] font-semibold uppercase tracking-[0.5px] text-text-secondary',
										col.className
									)}
								>
									{col.header}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{visibleData.map(row => {
							const rowColor = getRowColor?.(row);
							return (
								<tr
									key={getRowKey(row)}
									className="p-4 text-sm text-text-primary border-b border-border-primary transition-colors hover:bg-bg-hover"
								>
									{rowColor && (
										<td
											aria-hidden="true"
											className="p-0"
											style={{ backgroundColor: `var(--color-${rowColor})` }}
										/>
									)}
									{columns.map(col => (
										<td key={col.id} className={cn('p-4', col.className)}>
											{typeof col.cell === 'function' ? col.cell(row) : String(row[col.cell])}
										</td>
									))}
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			<Pagination
				currentPage={pagination.currentPage}
				totalPages={pagination.totalPages}
				startIndex={pagination.startIndex}
				endIndex={pagination.endIndex}
				totalItems={data.length}
				canGoPrev={pagination.canGoPrev}
				canGoNext={pagination.canGoNext}
				pageRange={pagination.pageRange}
				entityName={entityName}
				onPageChange={pagination.setPage}
				onNextPage={pagination.nextPage}
				onPrevPage={pagination.prevPage}
				onFirstPage={pagination.firstPage}
				onLastPage={pagination.lastPage}
			/>
		</div>
	);
}
