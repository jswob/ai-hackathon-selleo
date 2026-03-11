/** Error with structured details from API responses. */
export class ApiError extends Error {
	status?: number;
	details?: Record<string, unknown>;

	constructor(message: string, status?: number, details?: Record<string, unknown>) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.details = details;
	}
}

export type TraitDefinitionConflict = {
	participantTraits?: { count: number; invalidValues: string[] };
	rules?: { count: number; ruleIds: string[] };
};

export type TaskTypeConflict = {
	tasks?: { count: number };
	templateCleanup?: {
		rules: { count: number };
		taskTypeRoles: { count: number };
	};
};

export type RoleTypeConflict = {
	roles?: { count: number };
	templateCleanup?: {
		taskTypeRoles: { count: number };
		roleTypeEligibility: { count: number };
		rules: { count: number };
		taskTypesAffected?: Array<{
			taskTypeId: string;
			taskTypeName: string;
			removedPosition: number;
			remainingRoles: number;
			invalidRules: number;
			willBeDeleted: boolean;
			willBeArchived: boolean;
		}>;
	};
};

/** Type guard for 409 conflict errors with structured details. */
export function isConflictError(err: unknown): err is ApiError {
	return err instanceof ApiError && err.status === 409 && err.details !== undefined;
}

/** Type guard for any 409 conflict error (with or without details). */
export function isConflictStatus(err: unknown): err is ApiError {
	return err instanceof ApiError && err.status === 409;
}

export function extractErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}

	if (typeof error === 'string') {
		return error;
	}

	if (error && typeof error === 'object') {
		if ('message' in error) return String(error.message);
		if ('error' in error && typeof (error as { error: unknown }).error === 'string') {
			return (error as { error: string }).error;
		}
	}

	return 'An unknown error occurred';
}

export function isEdenError(error: unknown): error is { message: string; status?: number } {
	return Boolean(
		error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
	);
}
