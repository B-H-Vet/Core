// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';
import sonarjs from 'eslint-plugin-sonarjs';
import security from 'eslint-plugin-security';
import boundaries from 'eslint-plugin-boundaries';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', 'dist', 'node_modules', 'coverage', 'Core/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  eslintPluginPrettierRecommended,
  importPlugin.flatConfigs.recommended,
  sonarjs.configs.recommended,
  security.configs.recommended,
  {
    plugins: {
      'unused-imports': unusedImports,
      boundaries,
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      'boundaries/elements': [
        {
          type: 'controllers',
          pattern: 'src/**/controllers/*',
        },
        {
          type: 'services',
          pattern: 'src/**/services/*',
        },
        {
          type: 'repositories',
          pattern: 'src/**/repositories/*',
        },
        {
          type: 'domain',
          pattern: 'src/**/domain/*',
        },
        {
          type: 'infrastructure',
          pattern: 'src/infrastructure/*',
        },
        {
          type: 'shared',
          pattern: 'src/shared/*',
        },
      ],
    },
  },
  {
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
        },
      ],
      '@typescript-eslint/no-extraneous-class': 'off',

      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/require-await': 'error',

      'import/no-unresolved': 'off',
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
          },
        },
      ],
      'unused-imports/no-unused-imports': 'error',
      /* Reglas de Validación de Arquitectura.
      Útiles posteriormente en la etapa de finalización
      de este proyecto.
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            {
              from: 'controllers',
              allow: ['services', 'shared'],
            },
            {
              from: 'services',
              allow: ['repositories', 'domain', 'shared', 'infrastructure'],
            },
            {
              from: 'repositories',
              allow: ['domain', 'shared', 'infrastructure'],
            },
            {
              from: 'infrastructure',
              allow: ['shared'],
            },
          ],
        },
      ],
      */

      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
);
