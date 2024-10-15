import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: [
    '.vscode/settings.json',
    'package.json',
    'tsconfig.json',
  ],
  plugins: {
  },
  languageOptions: {
  },
  rules: {
    'no-console': 'off',
  },
  settings: {
  },
})
