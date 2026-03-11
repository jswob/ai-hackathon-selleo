import { useCallback, useState } from 'react';
import type { z } from 'zod';

/**
 * Form validation hook powered by Zod's `safeParse`.
 *
 * Works with flat `z.object()` schemas only. Schemas wrapped in `.refine()` or
 * `.transform()` return `ZodEffects`, which won't match the `ZodObject` generic
 * constraint — this is intentional so `keyof` inference stays type-safe.
 */
export function useFormValidation<T extends z.ZodObject<z.ZodRawShape>>(schema: T) {
	type Fields = keyof z.infer<T>;
	const [errors, setErrors] = useState<Partial<Record<Fields, string>>>({});

	const validate = useCallback(
		(data: z.infer<T>): boolean => {
			const result = schema.safeParse(data);
			if (result.success) {
				setErrors({});
				return true;
			}

			const fieldErrors: Partial<Record<Fields, string>> = {};
			for (const issue of result.error.issues) {
				const key = issue.path[0] as Fields;
				if (key !== undefined && !(key in fieldErrors)) {
					fieldErrors[key] = issue.message;
				}
			}
			setErrors(fieldErrors);
			return false;
		},
		[schema]
	);

	const clearError = useCallback((field: Fields) => {
		setErrors(prev => {
			const next = { ...prev };
			delete next[field];
			return next;
		});
	}, []);

	const clearErrors = useCallback(() => {
		setErrors({});
	}, []);

	return { errors, validate, clearError, clearErrors } as const;
}
