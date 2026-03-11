import type { ReactNode } from 'react';

/** Extracts keys of TData whose values are string or number (safe for direct display). */
type StringKeys<T> = {
	[K in keyof T]: T[K] extends string | number ? K : never;
}[keyof T];

/** Defines a single column in the DataTable. */
export interface ColumnDef<TData> {
	id: string;
	header: string;
	/** Property key (string/number fields only) for direct display, or render function for custom content. */
	cell: StringKeys<TData> | ((row: TData) => ReactNode);
	className?: string;
	/** Proportional column width (like CSS flex-grow). Default: 1 */
	grow?: number;
}

export interface DataTableProps<TData> {
	columns: ColumnDef<TData>[];
	data: TData[];
	getRowKey: (row: TData) => string | number;
	/** Display name for pagination info text. Default: "items" */
	entityName?: string;
	/** Number of rows per page. Default: 10 */
	pageSize?: number;
	isLoading?: boolean;
	error?: Error | null;
	/** Message shown when data array is empty. Default: "No data found." */
	emptyMessage?: string;
	/** Minimum number of rows to reserve space for, preventing table height from shrinking on sparse pages. */
	minRows?: number;
	/** Extracts a theme color name for the row's left-edge indicator bar. */
	getRowColor?: (row: TData) => string;
}
