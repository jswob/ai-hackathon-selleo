import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config([
	{
		ignores: [
			'**/node_modules/',
			'**/dist/',
			'**/build/',
			'**/coverage/',
			'**/*.d.ts',
			'**/drizzle/',
			'.claude/',
		],
	},
	{
		files: ['**/*.{ts,tsx,js,jsx}'],
		extends: [js.configs.recommended, ...tseslint.configs.recommendedTypeChecked, prettierConfig],
		plugins: {
			import: importPlugin,
			prettier: prettierPlugin,
		},
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				...globals.node,
			},
			parserOptions: {
				tsconfigRootDir: import.meta.dirname,
				projectService: true,
			},
		},
		settings: {
			'import/resolver': {
				typescript: true,
			},
		},
		rules: {
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/consistent-type-imports': 'error',
			'@typescript-eslint/no-non-null-assertion': 'warn',
			'@typescript-eslint/naming-convention': [
				'error',
				{
					selector: 'variableLike',
					format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
				},
				{
					selector: 'typeLike',
					format: ['PascalCase'],
				},
			],
			'import/order': [
				'error',
				{
					groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
					alphabetize: {
						order: 'asc',
					},
				},
			],
			'import/no-duplicates': 'error',
			'import/newline-after-import': 'error',
			'no-console': ['warn', { allow: ['warn', 'error'] }],
			'no-debugger': 'error',
			'prefer-const': 'error',
			'no-var': 'error',
			'object-shorthand': 'error',
			'prefer-template': 'error',
			'no-implicit-coercion': ['error', { boolean: true, number: true, string: true }],
			'prettier/prettier': 'error',
		},
	},
	{
		files: ['**/*.config.{ts,js}', '**/*.d.ts'],
		languageOptions: {
			globals: globals.node,
		},
	},
	{
		files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
		rules: {
			'no-console': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
		},
	},
]);
