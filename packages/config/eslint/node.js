import globals from 'globals';
import tseslint from 'typescript-eslint';
import baseConfig from './base.js';

export default tseslint.config([
	...baseConfig,
	{
		files: ['**/*.{ts,js}'],
		languageOptions: {
			globals: {
				...globals.node,
				Bun: 'readonly',
			},
		},
		rules: {
			'no-console': 'off',
		},
	},
]);
