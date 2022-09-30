import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		coverage: {
			reporter: ['text', 'lcov', 'clover']
		}
	},
	esbuild: {
		target: 'es2022'
	}
});
