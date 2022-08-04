import { Identifiers, Resolvers, Result } from '../../src';

describe('Integer resolver tests', () => {
	test('GIVEN a valid integer THEN returns its parsed value', () => {
		expect(Resolvers.resolveInteger('1')).toEqual(Result.ok(1));
	});
	test('GIVEN a valid integer with minimum THEN returns its parsed value', () => {
		expect(Resolvers.resolveInteger('2', { minimum: 2 })).toEqual(Result.ok(2));
	});
	test('GIVEN a valid integer with maximum THEN returns its parsed value', () => {
		expect(Resolvers.resolveInteger('3', { maximum: 4 })).toEqual(Result.ok(3));
	});
	test('GIVEN a integer before minimum THEN returns error', () => {
		expect(Resolvers.resolveInteger('1', { minimum: 2 })).toEqual(Result.err(Identifiers.ArgumentIntegerTooSmall));
	});
	test('GIVEN a integer beyond maximum THEN returns error', () => {
		expect(Resolvers.resolveInteger('5', { maximum: 4 })).toEqual(Result.err(Identifiers.ArgumentIntegerTooLarge));
	});
	test('GIVEN an invalid integer THEN returns error', () => {
		expect(Resolvers.resolveInteger('hello')).toEqual(Result.err(Identifiers.ArgumentIntegerError));
	});
});
