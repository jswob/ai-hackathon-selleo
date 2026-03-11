import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [react(), tailwindcss(), tsconfigPaths()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	test: {
		name: { label: '@meetings-scheduler/web', color: 'cyan' },
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./src/test/setup.ts'],
		exclude: ['**/node_modules/**', '**/e2e/**'],
	},
});
