import type { Config } from 'prettier'

const config: Config = {
  semi: false,
  endOfLine: 'auto',
  trailingComma: 'es5',
  arrowParens: 'always',
  proseWrap: 'preserve',
  quoteProps: 'as-needed',
  bracketSameLine: false,
  jsxSingleQuote: false,
  bracketSpacing: true,
  requirePragma: false,
  insertPragma: false,
  singleQuote: true,
  printWidth: 100,
  useTabs: false,
  tabWidth: 2,

  importOrder: [
    '^(react/(.*)$)|^(react$)',
    '^@(server|trpc)/(.*)$',
    '<THIRD_PARTY_MODULES>',
    '^@/(configs|libs)(.*)$',
    '^@/(redux|router)(.*)$',
    '^@/(constants|hooks|assets)(.*)$',
    '^@/(components)(.*)$',
    '^@/(layouts|contexts)(.*)$',
    '^@/(pages|views|containers)(.*)$',
    '^@/(utils/helper)(.*)$',
    '^@/(utils/validators)(.*)$',
    '^@/(.*)$',
    '^[./]',
  ],

  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  // importOrderBuiltinModulesToTop: true,
  // importOrderMergeDuplicateImports: true,
  // importOrderCombineTypeAndValueImports: true,
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],

  plugins: ['@trivago/prettier-plugin-sort-imports', 'prettier-plugin-tailwindcss'],
  tailwindAttributes: ['class', 'className'],
  tailwindFunctions: ['clsx', 'cn'],
}

export default config
