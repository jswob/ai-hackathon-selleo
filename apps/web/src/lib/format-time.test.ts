import { describe, expect, it } from 'vitest';

import { formatTimeRemaining } from './format-time';

describe('formatTimeRemaining', () => {
	it('formats 0 as "0 seconds"', () => {
		expect(formatTimeRemaining(0)).toBe('0 seconds');
	});

	it('formats 1 as "1 second"', () => {
		expect(formatTimeRemaining(1)).toBe('1 second');
	});

	it('formats plural seconds', () => {
		expect(formatTimeRemaining(45)).toBe('45 seconds');
	});

	it('formats exactly 1 minute', () => {
		expect(formatTimeRemaining(60)).toBe('1 minute');
	});

	it('formats 1 minute with seconds', () => {
		expect(formatTimeRemaining(90)).toBe('1 minute 30 seconds');
	});

	it('formats plural minutes with seconds', () => {
		expect(formatTimeRemaining(125)).toBe('2 minutes 5 seconds');
	});

	it('formats plural minutes without seconds', () => {
		expect(formatTimeRemaining(120)).toBe('2 minutes');
	});

	it('formats 1 minute 1 second singular', () => {
		expect(formatTimeRemaining(61)).toBe('1 minute 1 second');
	});

	it('floors decimal values', () => {
		expect(formatTimeRemaining(45.9)).toBe('45 seconds');
		expect(formatTimeRemaining(90.7)).toBe('1 minute 30 seconds');
	});

	it('treats negative values as 0', () => {
		expect(formatTimeRemaining(-5)).toBe('0 seconds');
	});
});
