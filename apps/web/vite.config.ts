import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	// Load env file from project root (../../)
	const env = loadEnv(mode, '../..', '');

	return {
		plugins: [tanstackRouter({ target: 'react', autoCodeSplitting: true }), tailwindcss(), react()],
		resolve: {
			alias: {
				'@': path.resolve(__dirname, './src'),
			},
		},
		server: {
			port: parseInt(env.WEB_PORT || '5173'),
		},
		define: {
			'import.meta.env.VITE_API_URL': JSON.stringify(
				process.env.VITE_API_URL ||
					(mode === 'production' ? '' : `http://localhost:${env.API_PORT || '3001'}`)
			),
		},
		test: {
			environment: 'jsdom',
			globals: true,
			setupFiles: ['./src/test/setup.ts'],
			exclude: ['**/node_modules/**', '**/e2e/**'],
		},
	};
});
