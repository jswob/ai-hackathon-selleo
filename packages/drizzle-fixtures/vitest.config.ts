import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		globals: true,
		environment: 'node',
		setupFiles: ['./vitest.setup.ts'],
		pool: 'forks',
		poolOptions: {
			forks: {
				singleFork: true,
			},
		},
		// Longer timeout for integration tests (database operations)
		testTimeout: 30000,
		hookTimeout: 30000,
	},
});
