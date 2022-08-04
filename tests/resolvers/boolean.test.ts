import { Identifiers, Resolvers, Result } from '../../src';

describe('Boolean resolver tests', () => {
	test('GIVEN a truthy value THEN returns true', () => {
		expect(Resolvers.resolveBoolean('true')).toEqual(Result.ok(true));
		expect(Resolvers.resolveBoolean('1')).toEqual(Result.ok(true));
		expect(Resolvers.resolveBoolean('+')).toEqual(Result.ok(true));
		expect(Resolvers.resolveBoolean('yes')).toEqual(Result.ok(true));
	});
	test('GIVEN a falsy value THEN returns false', () => {
		expect(Resolvers.resolveBoolean('false')).toEqual(Result.ok(false));
		expect(Resolvers.resolveBoolean('0')).toEqual(Result.ok(false));
		expect(Resolvers.resolveBoolean('-')).toEqual(Result.ok(false));
		expect(Resolvers.resolveBoolean('no')).toEqual(Result.ok(false));
	});
	test('GIVEN a truthy value with custom ones THEN returns true', () => {
		expect(Resolvers.resolveBoolean('yay', { truths: ['yay'] })).toEqual(Result.ok(true));
		expect(Resolvers.resolveBoolean('yup', { truths: ['yay', 'yup', 'yop'] })).toEqual(Result.ok(true));
	});
	test('GIVEN a falsy value with custom ones THEN returns false', () => {
		expect(Resolvers.resolveBoolean('nah', { falses: ['nah'] })).toEqual(Result.ok(false));
		expect(Resolvers.resolveBoolean('nope', { falses: ['nah', 'nope', 'noooo'] })).toEqual(Result.ok(false));
	});
	test('GIVEN an invalid values THEN returns error', () => {
		expect(Resolvers.resolveBoolean('hello')).toEqual(Result.err(Identifiers.ArgumentBooleanError));
		expect(Resolvers.resolveBoolean('world', { truths: ['nah', 'nope', 'noooo'] })).toEqual(Result.err(Identifiers.ArgumentBooleanError));
	});
});
