import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
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
			'**/routeTree.gen.ts',
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
			'import/internal-regex': '^@/',
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
					filter: {
						regex: '^_',
						match: false,
					},
					format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
				},
				{
					selector: 'variableLike',
					filter: {
						regex: '^_',
						match: true,
					},
					format: null,
					custom: {
						regex: '^_[a-zA-Z][a-zA-Z0-9]*$',
						match: true,
					},
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
		files: ['apps/web/src/**/*.{ts,tsx}'],
		plugins: {
			'react-hooks': reactHooks,
			'react-refresh': reactRefresh,
		},
		languageOptions: {
			globals: globals.browser,
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
		rules: {
			...reactHooks.configs.recommended.rules,
			'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
		},
	},
	{
		files: ['apps/api/src/**/*.{ts,js}'],
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
			'@typescript-eslint/no-non-null-assertion': 'off',
		},
	},
	{
		files: ['**/scripts/**/*.{ts,js}'],
		rules: {
			'no-console': 'off',
		},
	},
	{
		files: ['**/vitest.config.ts', '**/vitest.setup.ts', '**/example.ts'],
		rules: {
			'no-console': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/no-unsafe-return': 'off',
			'@typescript-eslint/no-unsafe-call': 'off',
			'@typescript-eslint/no-unsafe-argument': 'off',
		},
	},
]);
