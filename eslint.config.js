import js from '@eslint/js';
import globals from 'globals';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
    // Ignore patterns
    {
        ignores: [
            'dist/**',
            'coverage/**',
            'node_modules/**',
            '*.config.js',
            '*.config.ts',
        ],
    },

    // Base JavaScript config
    {
        files: ['**/*.{js,mjs,cjs,ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.es2021,
                ...globals.node,
                chrome: 'readonly',
                global: 'readonly',
                Console: 'readonly',
            },
            parser: tsparser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        plugins: {
            '@typescript-eslint': tseslint,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            ...js.configs.recommended.rules,
            ...tseslint.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,

            // TypeScript specific
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],

            // React Refresh
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],

            // General - allow console for debugging
            'no-console': 'off', // Change to 'warn' to see warnings, 'error' to forbid
            'prefer-const': 'error',
            'no-var': 'error',
        },
    },

    // Test files ONLY - relaxed rules
    {
        files: [
            '**/*.test.{ts,tsx}',
            '**/*.spec.{ts,tsx}',
            'src/test/**/*.{ts,tsx}',
        ],
        languageOptions: {
            globals: {
                ...globals.node,
                beforeAll: 'readonly',
                afterAll: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                describe: 'readonly',
                it: 'readonly',
                expect: 'readonly',
                vi: 'readonly',
            },
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            'no-console': 'off',
            'no-undef': 'off',
        },
    },
];
