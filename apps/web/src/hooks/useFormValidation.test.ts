import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { useFormValidation } from './useFormValidation';

const schema = z.object({
	name: z.string().min(1, 'Name is required'),
	email: z.string().email('Invalid email'),
});

describe('useFormValidation', () => {
	it('returns empty errors initially', () => {
		const { result } = renderHook(() => useFormValidation(schema));

		expect(result.current.errors).toEqual({});
	});

	it('validate() returns true for valid data, errors stay empty', () => {
		const { result } = renderHook(() => useFormValidation(schema));

		let isValid: boolean;
		act(() => {
			isValid = result.current.validate({ name: 'Alice', email: 'alice@test.com' });
		});

		expect(isValid!).toBe(true);
		expect(result.current.errors).toEqual({});
	});

	it('validate() returns false for invalid data', () => {
		const { result } = renderHook(() => useFormValidation(schema));

		let isValid: boolean;
		act(() => {
			isValid = result.current.validate({ name: '', email: 'bad' });
		});

		expect(isValid!).toBe(false);
	});

	it('sets per-field error messages on failed validation', () => {
		const { result } = renderHook(() => useFormValidation(schema));

		act(() => {
			result.current.validate({ name: '', email: 'bad' });
		});

		expect(result.current.errors.name).toBe('Name is required');
		expect(result.current.errors.email).toBe('Invalid email');
	});

	it('only keeps first error per field', () => {
		const multiErrorSchema = z.object({
			password: z.string().min(8, 'Too short').regex(/[A-Z]/, 'Needs uppercase'),
		});

		const { result } = renderHook(() => useFormValidation(multiErrorSchema));

		act(() => {
			result.current.validate({ password: 'ab' });
		});

		expect(result.current.errors.password).toBe('Too short');
	});

	it('clearError(field) removes one field error, keeps others', () => {
		const { result } = renderHook(() => useFormValidation(schema));

		act(() => {
			result.current.validate({ name: '', email: 'bad' });
		});
		expect(result.current.errors.name).toBeDefined();
		expect(result.current.errors.email).toBeDefined();

		act(() => {
			result.current.clearError('name');
		});

		expect(result.current.errors.name).toBeUndefined();
		expect(result.current.errors.email).toBe('Invalid email');
	});

	it('clearErrors() resets all errors', () => {
		const { result } = renderHook(() => useFormValidation(schema));

		act(() => {
			result.current.validate({ name: '', email: 'bad' });
		});
		expect(Object.keys(result.current.errors).length).toBeGreaterThan(0);

		act(() => {
			result.current.clearErrors();
		});

		expect(result.current.errors).toEqual({});
	});

	it('successful validate() after failed one clears errors', () => {
		const { result } = renderHook(() => useFormValidation(schema));

		act(() => {
			result.current.validate({ name: '', email: 'bad' });
		});
		expect(Object.keys(result.current.errors).length).toBeGreaterThan(0);

		act(() => {
			result.current.validate({ name: 'Alice', email: 'alice@test.com' });
		});

		expect(result.current.errors).toEqual({});
	});
});
