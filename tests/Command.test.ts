import { Command } from '../src';

describe('Tests', () => {
	test('GIVEN typeof Command THEN returns function', () => {
		expect(typeof Command).toBe('function');
	});
});
