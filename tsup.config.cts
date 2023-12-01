import { esbuildPluginFilePathExtensions } from 'esbuild-plugin-file-path-extensions';
import { esbuildPluginVersionInjector } from 'esbuild-plugin-version-injector';
import { defineConfig } from 'tsup';

export default defineConfig({
	clean: true,
	entry: ['src/**/*.ts'],
	outDir: 'dist/cjs',
	format: 'cjs',
	dts: true,
	minify: false,
	skipNodeModulesBundle: true,
	sourcemap: true,
	target: 'es2021',
	tsconfig: 'src/tsconfig.json',
	keepNames: true,
	esbuildPlugins: [esbuildPluginVersionInjector(), esbuildPluginFilePathExtensions()],
	treeshake: true,
	outExtension: () => ({ js: '.cjs' })
});
