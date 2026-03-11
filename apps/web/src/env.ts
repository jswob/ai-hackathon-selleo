import { z } from 'zod';

const envSchema = z.object({
	VITE_API_URL: z.string().default(''),
});

const _env = envSchema.safeParse(import.meta.env);

if (!_env.success) {
	console.error('Invalid environment variables:', _env.error.flatten().fieldErrors);
	throw new Error('Invalid environment variables');
}

export const ENV = _env.data;
