/**
 * Check whether a thrown error is a PostgreSQL unique constraint violation (code 23505).
 * @param error - The caught error value to inspect
 */
export function isUniqueViolation(error: unknown): boolean {
	if (typeof error !== 'object' || error === null) return false;
	const cause = (error as { cause?: { code?: string } }).cause;
	if (cause && typeof cause === 'object' && 'code' in cause && cause.code === '23505') {
		return true;
	}
	if ('code' in error && (error as { code: string }).code === '23505') {
		return true;
	}
	return false;
}
