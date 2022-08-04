import { Identifiers, Resolvers, Result } from '../../src';

describe('Enum resolver tests', () => {
	test('GIVEN good lowercase enum from one option THEN returns string', () => {
		const resolvedEnum = Resolvers.resolveEnum('foo', { enum: ['foo'] });
		expect(resolvedEnum).toEqual(Result.ok('foo'));
	});
	test('GIVEN good mixedcase enum from one option THEN returns string', () => {
		const resolvedEnum = Resolvers.resolveEnum('FoO', { enum: ['FoO'] });
		expect(resolvedEnum).toEqual(Result.ok('FoO'));
	});
	test('GIVEN good enum from more options THEN returns string', () => {
		const resolvedEnum = Resolvers.resolveEnum('foo', { enum: ['foo', 'bar', 'baz'] });
		expect(resolvedEnum).toEqual(Result.ok('foo'));
	});
	test('GIVEN good case insensitive enum from more options THEN returns string', () => {
		const resolvedEnum = Resolvers.resolveEnum('FoO', { enum: ['FoO', 'foo', 'bar', 'baz'], caseInsensitive: false });
		expect(resolvedEnum).toEqual(Result.ok('FoO'));
	});
	test('GIVEN good enum from one option THEN returns ArgumentEnumError', () => {
		const resolvedEnum = Resolvers.resolveEnum('foo', { enum: ['foo'] });
		expect(resolvedEnum.isOk()).toBe(true);
	});
	test('GIVEN an empty enum array THEN returns ArgumentEnumEmptyError', () => {
		const resolvedEnum = Resolvers.resolveEnum('foo');
		expect(resolvedEnum).toEqual(Result.err(Identifiers.ArgumentEnumEmptyError));
	});
	test('GIVEN an enum not listed in the array THEN returns ArgumentEnumError', () => {
		const resolvedEnum = Resolvers.resolveEnum('foo', { enum: ['bar', 'baz'] });
		expect(resolvedEnum).toEqual(Result.err(Identifiers.ArgumentEnumError));
	});
	test('GIVEN an enum with wrong case THEN returns ArgumentEnumError', () => {
		const resolvedEnum = Resolvers.resolveEnum('FOO', { enum: ['bar', 'baz'], caseInsensitive: false });
		expect(resolvedEnum).toEqual(Result.err(Identifiers.ArgumentEnumError));
	});
});
