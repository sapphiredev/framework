import { Identifiers, Resolvers, Result } from '../../src';

describe('String resolver tests', () => {
	test('GIVEN a valid string THEN returns it', () => {
		expect(Resolvers.resolveString('hello')).toEqual(Result.ok('hello'));

		expect(Resolvers.resolveString('100')).toEqual(Result.ok('100'));
	});
	test('GIVEN a valid string with minimum THEN returns it', () => {
		expect(Resolvers.resolveString('hello', { minimum: 2 })).toEqual(Result.ok('hello'));

		expect(Resolvers.resolveString('100', { minimum: 2 })).toEqual(Result.ok('100'));
	});
	test('GIVEN a valid string with maximum THEN returns its parsed value', () => {
		expect(Resolvers.resolveString('hello', { maximum: 10 })).toEqual(Result.ok('hello'));

		expect(Resolvers.resolveString('100', { maximum: 100 })).toEqual(Result.ok('100'));
	});
	test('GIVEN a string shorter than minimum THEN returns error', () => {
		expect(Resolvers.resolveString('hello', { minimum: 10 })).toEqual(Result.err(Identifiers.ArgumentStringTooShort));

		expect(Resolvers.resolveString('100', { minimum: 10 })).toEqual(Result.err(Identifiers.ArgumentStringTooShort));
	});
	test('GIVEN a string longer than maximum THEN returns error', () => {
		expect(Resolvers.resolveString('hello', { maximum: 2 })).toEqual(Result.err(Identifiers.ArgumentStringTooLong));

		expect(Resolvers.resolveString('100', { maximum: 2 })).toEqual(Result.err(Identifiers.ArgumentStringTooLong));
	});
});
