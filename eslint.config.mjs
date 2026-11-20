import sapphireEslintConfig from '@sapphire/eslint-config';

export default [
	{ ignores: ['dist/**', 'node_modules/**'] },
	...sapphireEslintConfig,
	{
		rules: {
			'@typescript-eslint/no-deprecated': 'warn',
			'@typescript-eslint/switch-exhaustiveness-check': ['error', { considerDefaultExhaustiveForUnions: true }],
			// Public interfaces are extension points for consumer module augmentation.
			'@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'always' }],
			'@typescript-eslint/prefer-function-type': 'off'
		}
	}
];
