import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import path from 'path';
import tseslint from 'typescript-eslint';

const root = import.meta.dirname;

export default defineConfig([
  // 1. IGNORES
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.turbo/**',
      '**/client/dist/**',
      '**/server/dist/**',
      '**/client/routeTree.gen.ts',
    ],
  },

  {
    languageOptions: {
      globals: {
        ...globals.node,
        Express: 'readonly',
      },
    },
  },

  js.configs.recommended,
  prettier,

  // 2. CLIENT
  {
    files: ['client/src/**/*.{ts,tsx}'],

    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: [path.join(root, 'client/tsconfig.eslint.json')],
        tsconfigRootDir: path.join(root, 'client'),
      },
      globals: {
        ...globals.browser,
      },
    },

    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'react-refresh': reactRefresh,
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

  // 3. SHADCN UI
  {
    files: ['client/src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },

  // 4. APP LAYER (FAST REFRESH ENABLED)
  {
    files: [
      'client/src/pages/**/*.{ts,tsx}',
      'client/src/routes/**/*.{ts,tsx}',
      'client/src/features/**/*.{ts,tsx}',
      'client/src/main.tsx',
    ],
    rules: {
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },

  // 5. SHARED CLIENT CODE
  {
    files: ['client/src/{lib,utils}/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },

  // 6. SERVER
  {
    files: ['server/src/**/*.ts'],

    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: [path.join(root, 'server/tsconfig.json')],
        tsconfigRootDir: path.join(root, 'server'),
      },
      globals: {
        ...globals.node,
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

      '@typescript-eslint/no-explicit-any': 'error',

      eqeqeq: 'error',
      curly: ['error', 'all'],
      'no-duplicate-imports': 'error',
    },
  },
]);
