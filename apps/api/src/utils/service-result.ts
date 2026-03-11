export type ErrorCode = 'NOT_FOUND' | 'VALIDATION' | 'CONFLICT' | 'INTERNAL';

export interface ServiceSuccess<T> {
	ok: true;
	data: T;
}

export interface ServiceError {
	code: ErrorCode;
	message: string;
	details?: Record<string, unknown>;
}

export interface ServiceFailure {
	ok: false;
	error: ServiceError;
}

export type ServiceResult<T> = ServiceSuccess<T> | ServiceFailure;

export function ok<T>(data: T): ServiceSuccess<T> {
	return { ok: true, data };
}

export function fail(
	code: ErrorCode,
	message: string,
	details?: Record<string, unknown>
): ServiceFailure {
	return { ok: false, error: { code, message, ...(details !== undefined && { details }) } };
}

const STATUS_MAP: Record<ErrorCode, number> = {
	NOT_FOUND: 404,
	VALIDATION: 422,
	CONFLICT: 409,
	INTERNAL: 500,
};

/**
 * Map a ServiceError to an HTTP status code and response body.
 * @param error - The service error to map
 */
export function mapError(error: ServiceError): {
	status: number;
	body: { error: string; details?: Record<string, unknown> };
} {
	return {
		status: STATUS_MAP[error.code],
		body: { error: error.message, ...(error.details !== undefined && { details: error.details }) },
	};
}
