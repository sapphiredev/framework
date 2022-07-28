import { Identifiers, Resolvers, Result } from '../../src';

describe('Number resolver tests', () => {
	test('GIVEN a valid number THEN returns its parsed value', () => {
		expect(Resolvers.resolveNumber('1.23')).toEqual(Result.ok(1.23));

		expect(Resolvers.resolveNumber('1')).toEqual(Result.ok(1));
	});
	test('GIVEN a valid number with minimum THEN returns its parsed value', () => {
		expect(Resolvers.resolveNumber('2.34', { minimum: 2 })).toEqual(Result.ok(2.34));

		expect(Resolvers.resolveNumber('2', { minimum: 2 })).toEqual(Result.ok(2));
	});
	test('GIVEN a valid number with maximum THEN returns its parsed value', () => {
		expect(Resolvers.resolveNumber('3.45', { maximum: 4 })).toEqual(Result.ok(3.45));

		expect(Resolvers.resolveNumber('3', { maximum: 4 })).toEqual(Result.ok(3));
	});
	test('GIVEN a number smaller than minimum THEN returns error', () => {
		expect(Resolvers.resolveNumber('1.23', { minimum: 2 })).toEqual(Result.err(Identifiers.ArgumentNumberTooSmall));

		expect(Resolvers.resolveNumber('1', { minimum: 2 })).toEqual(Result.err(Identifiers.ArgumentNumberTooSmall));
	});
	test('GIVEN a number larger than maximum THEN returns error', () => {
		expect(Resolvers.resolveNumber('4.56', { maximum: 4 })).toEqual(Result.err(Identifiers.ArgumentNumberTooLarge));

		expect(Resolvers.resolveNumber('5', { maximum: 4 })).toEqual(Result.err(Identifiers.ArgumentNumberTooLarge));
	});
	test('GIVEN an invalid number THEN returns error', () => {
		expect(Resolvers.resolveNumber('hello')).toEqual(Result.err(Identifiers.ArgumentNumberError));
	});
});
