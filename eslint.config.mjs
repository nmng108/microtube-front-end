import eslintJS from '@eslint/js';
import eslintTS from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import importPlugin from 'eslint-plugin-import';
import jsdocPlugin from 'eslint-plugin-jsdoc';

export default eslintTS.config(
  { ignores: ['dist', '.yarn', '**/.pnp.*'] },
  importPlugin.flatConfigs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      eslintJS.configs.recommended,
      ...eslintTS.configs.recommended,
      eslintConfigPrettier,
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.serviceworker,
      },
      parserOptions: {},
    },
    plugins: {
      'react-hooks': reactHooksPlugin,
      'react-refresh': reactRefreshPlugin,
      'jsdoc': jsdocPlugin,
    },
    rules: {
      ...reactHooksPlugin.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'prefer-const': 'warn',
      'import/no-unresolved': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-wrapper-object-types': 'warn',
      'no-constant-binary-expression': 'warn',
    },
  }
);
