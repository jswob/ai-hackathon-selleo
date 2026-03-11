/** Formats a number of seconds into a human-readable "X minutes Y seconds" string. */
export function formatTimeRemaining(seconds: number): string {
	const total = Math.max(0, Math.floor(seconds));
	const minutes = Math.floor(total / 60);
	const secs = total % 60;

	const parts: string[] = [];

	if (minutes > 0) {
		parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
	}

	if (secs > 0 || minutes === 0) {
		parts.push(`${secs} ${secs === 1 ? 'second' : 'seconds'}`);
	}

	return parts.join(' ');
}
