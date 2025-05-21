import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: __dirname,
});

// Use FlatCompat to load configurations
const eslintConfig = [
  // Global ignores
  {
    ignores: [
      'node_modules/',
      '.next/',
      'dist/',
      '.DS_Store',
      '.storybook/',
      '**/*.stories.ts',
      '**/*.stories.tsx',
    ],
  },

  // Base TypeScript configuration using Next.js configurations
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  // TypeScript-specific rules
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json', // Essential for type-aware linting
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      // --- DEVELOPMENT_PHILOSOPHY_APPENDIX_TYPESCRIPT.md Enforcements ---
      '@typescript-eslint/no-explicit-any': [
        'error',
        { fixToUnknown: true, ignoreRestArgs: false },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/explicit-function-return-type': 'warn', // Start with warn, can move to error
      '@typescript-eslint/explicit-module-boundary-types': 'warn', // Start with warn
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }], // Next.js often uses async void for event handlers

      // Disallow @ts-ignore, @ts-expect-error, @ts-nocheck, @ts-check without explanation
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': 'allow-with-description',
          'ts-nocheck': 'allow-with-description',
          'ts-check': false, // Allow @ts-check for JS files
          minimumDescriptionLength: 10, // Require a meaningful explanation
        },
      ],
      // Forbid 'as any' - a stricter custom rule
      'no-restricted-syntax': [
        'error',
        {
          selector: "TSAsExpression[typeAnnotation.type='TSAnyKeyword']",
          message:
            "Type assertion to 'any' is forbidden. Use 'unknown' or a specific type. If 'any' is truly unavoidable, provide a detailed justification comment prefixed with '// ALLOWANCE: '.",
        },
        {
          selector: "TSTypeAssertion[typeAnnotation.type='TSAnyKeyword']",
          message:
            "Type assertion to 'any' is forbidden. Use 'unknown' or a specific type. If 'any' is truly unavoidable, provide a detailed justification comment prefixed with '// ALLOWANCE: '.",
        },
      ],
      // --- End Philosophy Enforcements ---
    },
  },

  // React specific rules
  {
    files: ['**/*.tsx', '**/*.jsx'],
    rules: {
      'react/prop-types': 'off', // Handled by TypeScript
      'react/react-in-jsx-scope': 'off', // Next.js handles this
    },
  },

  // Prettier compatibility - MUST BE LAST
  ...compat.extends('prettier'),
];

export default eslintConfig;
