import { defineConfig } from 'tsup';
import { esbuildPluginVersionInjector } from 'esbuild-plugin-version-injector';

export default defineConfig({
	clean: true,
	dts: true,
	entry: ['src/**/*.ts'],
	format: ['cjs'],
	minify: false,
	skipNodeModulesBundle: true,
	sourcemap: true,
	target: 'es2020',
	tsconfig: 'src/tsconfig.json',
	keepNames: true,
	esbuildPlugins: [
		esbuildPluginVersionInjector(),
		{
			name: 'add-extension-to-file-imports-and-exports',
			setup(build) {
				const isEsm = build.initialOptions.define?.TSUP_FORMAT === '"esm"';
				build.onResolve({ filter: /.*/ }, (args) => {
					if (args.importer) {
						return {
							path: `${args.path}.${isEsm ? 'mjs' : 'js'}`,
							external: true
						};
					}

					return undefined;
				});
			}
		}
	],
	treeshake: true,
	bundle: true,
	splitting: false
});
