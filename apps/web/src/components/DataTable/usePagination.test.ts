import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { usePagination } from './usePagination';

describe('usePagination', () => {
	it('returns correct defaults for empty data', () => {
		const { result } = renderHook(() => usePagination({ totalItems: 0 }));

		expect(result.current.currentPage).toBe(1);
		expect(result.current.totalPages).toBe(0);
		expect(result.current.startIndex).toBe(0);
		expect(result.current.endIndex).toBe(0);
		expect(result.current.canGoNext).toBe(false);
		expect(result.current.canGoPrev).toBe(false);
		expect(result.current.pageRange).toEqual([]);
	});

	it('returns correct defaults for single page', () => {
		const { result } = renderHook(() => usePagination({ totalItems: 5 }));

		expect(result.current.currentPage).toBe(1);
		expect(result.current.totalPages).toBe(1);
		expect(result.current.startIndex).toBe(0);
		expect(result.current.endIndex).toBe(5);
		expect(result.current.canGoNext).toBe(false);
		expect(result.current.canGoPrev).toBe(false);
		expect(result.current.pageRange).toEqual([1]);
	});

	it('respects custom pageSize', () => {
		const { result } = renderHook(() => usePagination({ totalItems: 25, pageSize: 5 }));

		expect(result.current.totalPages).toBe(5);
		expect(result.current.startIndex).toBe(0);
		expect(result.current.endIndex).toBe(5);
	});

	it('navigates to next page', () => {
		const { result } = renderHook(() => usePagination({ totalItems: 25 }));

		act(() => result.current.nextPage());

		expect(result.current.currentPage).toBe(2);
		expect(result.current.startIndex).toBe(10);
		expect(result.current.endIndex).toBe(20);
	});

	it('navigates to previous page', () => {
		const { result } = renderHook(() => usePagination({ totalItems: 25 }));

		act(() => result.current.setPage(3));
		act(() => result.current.prevPage());

		expect(result.current.currentPage).toBe(2);
	});

	it('cannot go before page 1', () => {
		const { result } = renderHook(() => usePagination({ totalItems: 25 }));

		expect(result.current.canGoPrev).toBe(false);

		act(() => result.current.prevPage());

		expect(result.current.currentPage).toBe(1);
	});

	it('cannot go past last page', () => {
		const { result } = renderHook(() => usePagination({ totalItems: 25 }));

		act(() => result.current.setPage(3));

		expect(result.current.canGoNext).toBe(false);

		act(() => result.current.nextPage());

		expect(result.current.currentPage).toBe(3);
	});

	it('clamps currentPage when totalItems shrinks (derived, no extra render)', () => {
		const { result, rerender } = renderHook(({ totalItems }) => usePagination({ totalItems }), {
			initialProps: { totalItems: 50 },
		});

		act(() => result.current.setPage(5));
		expect(result.current.currentPage).toBe(5);

		rerender({ totalItems: 20 });

		expect(result.current.currentPage).toBe(2);
		expect(result.current.totalPages).toBe(2);
	});

	it('handles endIndex clamped to totalItems on last page', () => {
		const { result } = renderHook(() => usePagination({ totalItems: 15 }));

		act(() => result.current.setPage(2));

		expect(result.current.startIndex).toBe(10);
		expect(result.current.endIndex).toBe(15);
	});

	it('navigates to first page', () => {
		const { result } = renderHook(() => usePagination({ totalItems: 50 }));

		act(() => result.current.setPage(4));
		expect(result.current.currentPage).toBe(4);

		act(() => result.current.firstPage());
		expect(result.current.currentPage).toBe(1);
	});

	it('firstPage is idempotent when already on page 1', () => {
		const { result } = renderHook(() => usePagination({ totalItems: 50 }));

		expect(result.current.currentPage).toBe(1);

		act(() => result.current.firstPage());
		expect(result.current.currentPage).toBe(1);
	});

	it('navigates to last page', () => {
		const { result } = renderHook(() => usePagination({ totalItems: 50 }));

		expect(result.current.currentPage).toBe(1);

		act(() => result.current.lastPage());
		expect(result.current.currentPage).toBe(5);
	});

	it('lastPage is idempotent when already on last page', () => {
		const { result } = renderHook(() => usePagination({ totalItems: 50 }));

		act(() => result.current.setPage(5));
		expect(result.current.currentPage).toBe(5);

		act(() => result.current.lastPage());
		expect(result.current.currentPage).toBe(5);
	});

	describe('pageRange sliding window', () => {
		it('shows all pages when totalPages <= 5', () => {
			const { result } = renderHook(() => usePagination({ totalItems: 30, pageSize: 10 }));

			expect(result.current.pageRange).toEqual([1, 2, 3]);
		});

		it('shows first 5 pages when on page 1 with many pages', () => {
			const { result } = renderHook(() => usePagination({ totalItems: 100 }));

			expect(result.current.pageRange).toEqual([1, 2, 3, 4, 5]);
		});

		it('centers current page in window', () => {
			const { result } = renderHook(() => usePagination({ totalItems: 100 }));

			act(() => result.current.setPage(5));

			expect(result.current.pageRange).toEqual([3, 4, 5, 6, 7]);
		});

		it('clamps window at the end', () => {
			const { result } = renderHook(() => usePagination({ totalItems: 100 }));

			act(() => result.current.setPage(10));

			expect(result.current.pageRange).toEqual([6, 7, 8, 9, 10]);
		});

		it('clamps window at the start', () => {
			const { result } = renderHook(() => usePagination({ totalItems: 100 }));

			act(() => result.current.setPage(2));

			expect(result.current.pageRange).toEqual([1, 2, 3, 4, 5]);
		});
	});
});
