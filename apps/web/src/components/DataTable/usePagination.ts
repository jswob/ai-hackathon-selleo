import { useState } from 'react';

interface UsePaginationOptions {
	totalItems: number;
	pageSize?: number;
}

interface UsePaginationResult {
	currentPage: number;
	totalPages: number;
	startIndex: number;
	endIndex: number;
	canGoNext: boolean;
	canGoPrev: boolean;
	pageRange: number[];
	setPage: (page: number) => void;
	nextPage: () => void;
	prevPage: () => void;
	firstPage: () => void;
	lastPage: () => void;
}

/** Manages client-side pagination state with a sliding page-range window. */
export function usePagination({
	totalItems,
	pageSize = 10,
}: UsePaginationOptions): UsePaginationResult {
	const [rawPage, setRawPage] = useState(1);

	const totalPages = Math.ceil(totalItems / pageSize);
	const currentPage = Math.max(1, Math.min(rawPage, totalPages));

	const startIndex = (currentPage - 1) * pageSize;
	const endIndex = Math.min(startIndex + pageSize, totalItems);

	const canGoPrev = currentPage > 1;
	const canGoNext = currentPage < totalPages;

	// Sliding window: max 5 visible pages
	let pageRange: number[] = [];
	if (totalPages > 0) {
		let start = Math.max(1, currentPage - 2);
		const end = Math.min(totalPages, start + 4);
		start = Math.max(1, end - 4);
		pageRange = Array.from({ length: end - start + 1 }, (_unused, i) => start + i);
	}

	const setPage = (page: number) => setRawPage(page);
	const nextPage = () => {
		if (canGoNext) setRawPage(currentPage + 1);
	};
	const prevPage = () => {
		if (canGoPrev) setRawPage(currentPage - 1);
	};
	const firstPage = () => setRawPage(1);
	const lastPage = () => {
		if (totalPages > 0) setRawPage(totalPages);
	};

	return {
		currentPage,
		totalPages,
		startIndex,
		endIndex,
		canGoNext,
		canGoPrev,
		pageRange,
		setPage,
		nextPage,
		prevPage,
		firstPage,
		lastPage,
	};
}
