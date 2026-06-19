import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import path from 'path';
import tseslint from 'typescript-eslint';

const root = import.meta.dirname;

export default defineConfig([
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.turbo/**',
      '**/routeTree.gen.ts',
    ],
  },

  js.configs.recommended,
  prettier,

  {
    files: ['apps/client/**/*.{ts,tsx}'],

    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: [path.join(root, 'apps/client/tsconfig.eslint.json')],
        tsconfigRootDir: path.join(root, 'apps/client'),
      },
      globals: {
        ...globals.browser,
      },
    },

    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },

    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': 'off',
      'no-debugger': 'warn',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': 'warn',
      eqeqeq: 'error',
      curly: ['error', 'all'],
      'no-duplicate-imports': 'error',
    },
  },

  {
    files: ['apps/client/src/**/*.{ts,tsx}'],

    plugins: {
      'react-refresh': reactRefresh,
    },

    rules: {
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },

  {
    files: [
      'apps/client/test/**/*',
      'apps/client/**/*.{test,spec}.{ts,tsx}',
      'apps/client/test-utils.{ts,tsx}',
      'apps/client/**/*.test-utils.{ts,tsx}',
    ],

    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },

  {
    files: ['apps/client/src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },

  {
    files: ['apps/server/**/*.{ts,tsx}'],

    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: [path.join(root, 'apps/server/tsconfig.eslint.json')],
        tsconfigRootDir: path.join(root, 'apps/server'),
      },
      globals: {
        ...globals.node,
      },
    },

    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },

    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      eqeqeq: 'error',
      curly: ['error', 'multi-line'],
      'no-duplicate-imports': 'error',
    },
  },
]);
