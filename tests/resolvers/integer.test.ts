import { Identifiers, Resolvers } from '../../src';

describe('Integer resolver tests', () => {
	test('GIVEN a valid integer THEN returns its parsed value', () => {
		const resolvedInteger = Resolvers.resolveInteger('1');
		expect(resolvedInteger.success).toBe(true);
		expect(resolvedInteger.error).toBeUndefined();
		expect(resolvedInteger.value).toBe(1);
	});
	test('GIVEN a valid integer with minimum THEN returns its parsed value', () => {
		const resolvedInteger = Resolvers.resolveInteger('2', { minimum: 2 });
		expect(resolvedInteger.success).toBe(true);
		expect(resolvedInteger.error).toBeUndefined();
		expect(resolvedInteger.value).toBe(2);
	});
	test('GIVEN a valid integer with maximum THEN returns its parsed value', () => {
		const resolvedInteger = Resolvers.resolveInteger('3', { maximum: 4 });
		expect(resolvedInteger.success).toBe(true);
		expect(resolvedInteger.error).toBeUndefined();
		expect(resolvedInteger.value).toBe(3);
	});
	test('GIVEN a integer before minimum THEN returns error', () => {
		const resolvedInteger = Resolvers.resolveInteger('1', { minimum: 2 });
		expect(resolvedInteger.success).toBe(false);
		expect(resolvedInteger.value).toBeUndefined();
		expect(resolvedInteger.error).toBe(Identifiers.ArgumentIntegerTooSmall);
	});
	test('GIVEN a integer beyond maximum THEN returns error', () => {
		const resolvedInteger = Resolvers.resolveInteger('5', { maximum: 4 });
		expect(resolvedInteger.success).toBe(false);
		expect(resolvedInteger.value).toBeUndefined();
		expect(resolvedInteger.error).toBe(Identifiers.ArgumentIntegerTooLarge);
	});
	test('GIVEN an invalid integer THEN returns error', () => {
		const resolvedInteger = Resolvers.resolveInteger('hello');
		expect(resolvedInteger.success).toBe(false);
		expect(resolvedInteger.value).toBeUndefined();
		expect(resolvedInteger.error).toBe(Identifiers.ArgumentIntegerError);
	});
});
