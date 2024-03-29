import { Result } from '@sapphire/result';
import { Identifiers } from '../../src/lib/errors/Identifiers';
import { resolveFloat } from '../../src/lib/resolvers/float';

describe('Float resolver tests', () => {
	test('GIVEN a valid float THEN returns its parsed value', () => {
		expect(resolveFloat('1.23')).toEqual(Result.ok(1.23));
	});
	test('GIVEN a valid float with minimum THEN returns its parsed value', () => {
		expect(resolveFloat('2.34', { minimum: 2 })).toEqual(Result.ok(2.34));
	});
	test('GIVEN a valid float with maximum THEN returns its parsed value', () => {
		expect(resolveFloat('3.45', { maximum: 4 })).toEqual(Result.ok(3.45));
	});
	test('GIVEN a float before minimum THEN returns error', () => {
		expect(resolveFloat('1.23', { minimum: 2 })).toEqual(Result.err(Identifiers.ArgumentFloatTooSmall));
	});
	test('GIVEN a float beyond maximum THEN returns error', () => {
		expect(resolveFloat('4.56', { maximum: 4 })).toEqual(Result.err(Identifiers.ArgumentFloatTooLarge));
	});
	test('GIVEN an invalid float THEN returns error', () => {
		expect(resolveFloat('hello')).toEqual(Result.err(Identifiers.ArgumentFloatError));
	});
});
