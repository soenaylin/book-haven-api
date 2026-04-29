import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';

export default defineConfig([
	/**
	 * Global ignores
	 */
	{
		ignores: ['dist/**', 'build/**', 'coverage/**', 'node_modules/**', '*.config.js', '*.config.cjs']
	},

	/**
	 * Base config for JS + TS
	 */
	{
		files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
		plugins: { js },
		extends: ['js/recommended'],
		rules: {
			/**
			 * General Code Quality
			 */
			'no-console': 'warn',
			'no-debugger': 'warn',

			/**
			 * Import Order
			 */
			'import/order': [
				'warn',
				{
					groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
					'newlines-between': 'always',
					alphabetize: {
						order: 'asc',
						caseInsensitive: true
					}
				}
			],

			/**
			 * TypeScript Hardening
			 */
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_'
				}
			],

			'@typescript-eslint/consistent-type-imports': [
				'warn',
				{
					prefer: 'type-imports',
					fixStyle: 'inline-type-imports'
				}
			],

			'@typescript-eslint/no-floating-promises': 'error',
			'@typescript-eslint/await-thenable': 'error',
			'@typescript-eslint/no-misused-promises': 'error',

			'prettier/prettier': [
				'warn',
				{
					arrowParens: 'always',
					trailingComma: 'none',
					tabWidth: 4,
					endOfLine: 'auto',
					useTabs: true,
					singleQuote: true,
					printWidth: 120,
					jsxSingleQuote: true
				}
			]
		},
		languageOptions: { globals: globals.node }
	},

	/**
	 * TypeScript Recommended
	 */
	tseslint.configs.recommended,

	/**
	 * TypeScript Strict
	 */
	tseslint.configs.strict,

	/**
	 * Type-aware rules (requires tsconfig)
	 */
	tseslint.configs.recommendedTypeChecked,

	/**
	 * Disable formatting conflicts with Prettier
	 */
	eslintConfigPrettier
]);
