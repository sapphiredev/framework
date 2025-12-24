import { defineConfig, type UserConfig } from 'tsdown';
import Replace from 'unplugin-replace/rolldown';
import { version } from './package.json';

const baseOptions: UserConfig = {
	clean: true,
	entry: ['src/**/*.ts'],
	dts: true,
	unbundle: true,
	minify: false,
	skipNodeModulesBundle: true,
	sourcemap: true,
	target: 'es2021',
	tsconfig: 'src/tsconfig.json',
	plugins: [
		Replace({
			values: [
				{
					find: /\[VI\]{{inject}}\[\/VI\]/,
					replacement: version
				}
			]
		})
	],
	treeshake: true
};

export default [
	defineConfig({
		...baseOptions,
		outDir: 'dist/cjs',
		format: 'cjs',
		banner: {
			js: '"use strict";'
		}
	}),
	defineConfig({
		...baseOptions,
		outDir: 'dist/esm',
		format: 'esm'
	})
];
