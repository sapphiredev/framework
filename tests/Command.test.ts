import { Command } from '../src';

describe('Command tests', () => {
	test('GIVEN typeof Command THEN returns function', () => {
		expect(typeof Command).toBe('function');
	});
});
