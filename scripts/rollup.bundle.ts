import versionInjector from 'rollup-plugin-version-injector';

export default {
	input: 'dist/index.js',
	output: [
		{
			file: './dist/index.js',
			format: 'cjs'
		}
	],
	plugins: [versionInjector()]
};
