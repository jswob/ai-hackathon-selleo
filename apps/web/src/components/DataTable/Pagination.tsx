import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	startIndex: number;
	endIndex: number;
	totalItems: number;
	canGoPrev: boolean;
	canGoNext: boolean;
	pageRange: number[];
	entityName: string;
	onPageChange: (page: number) => void;
	onNextPage: () => void;
	onPrevPage: () => void;
	onFirstPage: () => void;
	onLastPage: () => void;
}

export function Pagination({
	currentPage,
	totalPages,
	startIndex,
	endIndex,
	totalItems,
	canGoPrev,
	canGoNext,
	pageRange,
	entityName,
	onPageChange,
	onNextPage,
	onPrevPage,
	onFirstPage,
	onLastPage,
}: PaginationProps) {
	if (totalPages <= 1) return null;

	return (
		<div className="flex items-center justify-between border-t bg-bg-primary border-border-primary px-4 py-3">
			<span className="text-[13px] text-text-secondary">
				Showing {startIndex + 1}-{endIndex} of {totalItems} {entityName}
			</span>

			<div className="flex items-center gap-1">
				<button
					type="button"
					aria-label="Previous page"
					disabled={!canGoPrev}
					onClick={onPrevPage}
					className="rounded-sm border border-border-primary bg-bg-secondary px-2.5 py-1.5 text-[13px] disabled:cursor-not-allowed disabled:opacity-50"
				>
					<ChevronLeft className="h-4 w-4" />
				</button>

				{pageRange[0] !== 1 && (
					<>
						<button
							type="button"
							aria-label="First page"
							disabled={!canGoPrev}
							onClick={onFirstPage}
							className="rounded-sm border border-border-primary bg-bg-secondary px-2.5 py-1.5 text-[13px] disabled:cursor-not-allowed disabled:opacity-50"
						>
							1
						</button>
						{currentPage !== 4 && (
							<span className="px-1 text-[13px] text-text-secondary" aria-hidden="true">
								...
							</span>
						)}
					</>
				)}

				{pageRange.map(page => (
					<button
						key={page}
						type="button"
						aria-label={`Page ${page}`}
						aria-current={page === currentPage ? 'page' : undefined}
						onClick={() => onPageChange(page)}
						className={cn(
							'rounded-sm border px-2.5 py-1.5 text-[13px]',
							page === currentPage
								? 'border-primary bg-primary text-white'
								: 'border-border-primary bg-bg-secondary'
						)}
					>
						{page}
					</button>
				))}

				{pageRange[pageRange.length - 1] !== totalPages && (
					<>
						{currentPage !== totalPages - 3 && (
							<span className="px-1 text-[13px] text-text-secondary" aria-hidden="true">
								...
							</span>
						)}
						<button
							type="button"
							aria-label="Last page"
							disabled={!canGoNext}
							onClick={onLastPage}
							className="rounded-sm border border-border-primary bg-bg-secondary px-2.5 py-1.5 text-[13px] disabled:cursor-not-allowed disabled:opacity-50"
						>
							{totalPages}
						</button>
					</>
				)}

				<button
					type="button"
					aria-label="Next page"
					disabled={!canGoNext}
					onClick={onNextPage}
					className="rounded-sm border border-border-primary bg-bg-secondary px-2.5 py-1.5 text-[13px] disabled:cursor-not-allowed disabled:opacity-50"
				>
					<ChevronRight className="h-4 w-4" />
				</button>
			</div>
		</div>
	);
}
