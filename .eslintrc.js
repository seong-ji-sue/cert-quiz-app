module.exports = {
	root: true,
	env: {
		browser: true,
		es2021: true,
		node: true,
	},
	extends: [
		'eslint:recommended',
		'plugin:react/recommended',
		'next',
		'next/core-web-vitals',
		'prettier',
	],
	settings: {
		react: {
			version: 'detect',
		},
	},
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
		ecmaFeatures: {jsx: true},
	},
	plugins: ['react', 'prettier'],
	overrides: [
		{
			files: ['*.js', '*.jsx'],
			rules: {
				'react/jsx-filename-extension': [1, {extensions: ['.js', '.jsx']}],
				'react/prop-types': 'off',
			},
		},
		{
			env: {node: true},
			files: ['.eslintrc.{js,cjs}'],
			parserOptions: {sourceType: 'script'},
		},
	],
	rules: {
		'prettier/prettier': 'error',
	},
};
