import { Identifiers, Resolvers } from '../../src';

describe('Integer resolver tests', () => {
	test('GIVEN a valid integer THEN returns its parsed value', () => {
		const resolvedInteger = Resolvers.resolveInteger('1');
		expect(resolvedInteger.isOk()).toBe(true);
		expect(resolvedInteger.unwrapErr).toThrowError();
		expect(resolvedInteger.unwrap()).toBe(1);
	});
	test('GIVEN a valid integer with minimum THEN returns its parsed value', () => {
		const resolvedInteger = Resolvers.resolveInteger('2', { minimum: 2 });
		expect(resolvedInteger.isOk()).toBe(true);
		expect(resolvedInteger.unwrapErr).toThrowError();
		expect(resolvedInteger.unwrap()).toBe(2);
	});
	test('GIVEN a valid integer with maximum THEN returns its parsed value', () => {
		const resolvedInteger = Resolvers.resolveInteger('3', { maximum: 4 });
		expect(resolvedInteger.isOk()).toBe(true);
		expect(resolvedInteger.unwrapErr).toThrowError();
		expect(resolvedInteger.unwrap()).toBe(3);
	});
	test('GIVEN a integer before minimum THEN returns error', () => {
		const resolvedInteger = Resolvers.resolveInteger('1', { minimum: 2 });
		expect(resolvedInteger.isOk()).toBe(false);
		expect(resolvedInteger.unwrap).toThrowError();
		expect(resolvedInteger.unwrapErr()).toBe(Identifiers.ArgumentIntegerTooSmall);
	});
	test('GIVEN a integer beyond maximum THEN returns error', () => {
		const resolvedInteger = Resolvers.resolveInteger('5', { maximum: 4 });
		expect(resolvedInteger.isOk()).toBe(false);
		expect(resolvedInteger.unwrap).toThrowError();
		expect(resolvedInteger.unwrapErr()).toBe(Identifiers.ArgumentIntegerTooLarge);
	});
	test('GIVEN an invalid integer THEN returns error', () => {
		const resolvedInteger = Resolvers.resolveInteger('hello');
		expect(resolvedInteger.isOk()).toBe(false);
		expect(resolvedInteger.unwrap).toThrowError();
		expect(resolvedInteger.unwrapErr()).toBe(Identifiers.ArgumentIntegerError);
	});
});
