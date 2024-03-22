import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		reporters: ['default', ['vitest-sonar-reporter', { outputFile: 'sonar-report.xml' }]],
		coverage: {
			enabled: true,
			reporter: ['text', 'lcov', 'cobertura']
		}
	},
	esbuild: {
		target: 'es2022'
	}
});
