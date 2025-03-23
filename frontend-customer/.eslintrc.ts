import type { Linter } from 'eslint'

const config: Linter.Config = {
  $schema: 'https://json.schemastore.org/eslintrc',
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'next/core-web-vitals',
    'prettier',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:tailwindcss/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:prettier/recommended',
  ],

  // @ts-expect-error
  plugins: [
    'react',
    'react-hooks',
    'simple-import-sort',
    'tailwindcss',
    '@tanstack/query',
    '@typescript-eslint',
  ],

  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
  },

  settings: {
    next: {
      rootDir: ['apps/*/'],
    },
    tailwindcss: {
      callees: ['cn', 'cva'],
      config: 'tailwind.config.ts',
    },
    'import/resolver': {
      typescript: {},
      alias: {
        map: [['@', './src']],
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
      },
    },
  },

  env: {
    es6: true,
    browser: true,
    jest: true,
    node: true,
  },

  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@next/next/no-html-link-for-pages': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'off',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/forbid-prop-types': 'off',
    'react/require-default-props': 'off',
    'react/jsx-filename-extension': [
      1,
      {
        extensions: ['.tsx', '.jsx'],
      },
    ],
    'react/jsx-props-no-spreading': 'off',
    'import/prefer-default-export': 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        ts: 'never',
        tsx: 'never',
        js: 'never',
        jsx: 'never',
      },
    ],
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link'],
        specialLink: ['hrefLeft', 'hrefRight'],
        aspects: ['invalidHref', 'preferButton'],
      },
    ],
    'react/jsx-no-useless-fragment': [
      'warn',
      {
        allowExpressions: true,
      },
    ],
    'import/no-dynamic-require': 'off',
    'global-require': 'off',
    '@next/next/no-img-element': 'off',
    'react/function-component-definition': 'off',
    'react/no-danger': 'warn',
    'no-underscore-dangle': 'off',
    'react/display-name': 'off',
    'no-param-reassign': [
      'warn',
      {
        props: false,
      },
    ],
    'jsx-a11y/label-has-associated-control': 'off',
    'import/no-anonymous-default-export': 'off',
    '@tanstack/query/exhaustive-deps': 'error',
    'tailwindcss/no-custom-classname': 'off',
    'tailwindcss/classnames-order': 'error',
    'tailwindcss/migration-from-tailwind-2': 'off',
    'next/no-pages': 'off',
    'next/no-app': 'off',
  },
}

export default config
