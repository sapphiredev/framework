import { defineConfig } from 'tsdown';
import Replace from 'unplugin-replace/rolldown';
import packageJson from './package.json' with { type: 'json' };

export default defineConfig({
	clean: true,
	entry: ['src/**/*.ts'],
	dts: true,
	unbundle: true,
	minify: false,
	deps: { neverBundle: true },
	sourcemap: true,
	target: 'node24',
	tsconfig: 'src/tsconfig.json',
	outDir: 'dist',
	format: 'esm',
	plugins: [
		Replace({
			values: [
				{
					find: /\[VI]{{inject}}\[\/VI]/,
					replacement: packageJson.version
				}
			]
		})
	],
	treeshake: true
});
