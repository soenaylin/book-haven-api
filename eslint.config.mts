import path from 'node:path';
import { fileURLToPath } from 'node:url';

import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import-x';
import prettierPlugin from 'eslint-plugin-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Recreate __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
		plugins: { js, 'import-x': importPlugin, prettier: prettierPlugin },
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
			'import-x/order': [
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
		languageOptions: {
			globals: globals.node,
			parserOptions: {
				// Tells ESLint to use TypeScript's type information
				projectService: {
					allowDefaultProject: ['eslint.config.mts', 'prisma.config.ts']
				},
				// Points to your tsconfig (usually in the same directory)
				tsconfigRootDir: __dirname // Use the manual __dirname here
			}
		}
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
