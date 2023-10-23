import { Result } from '@sapphire/result';
import { Identifiers } from '../../src/lib/errors/Identifiers';
import { resolveBoolean } from '../../src/lib/resolvers/boolean';

describe('Boolean resolver tests', () => {
	test('GIVEN a truthy value THEN returns true', () => {
		expect(resolveBoolean('true')).toEqual(Result.ok(true));
		expect(resolveBoolean('1')).toEqual(Result.ok(true));
		expect(resolveBoolean('+')).toEqual(Result.ok(true));
		expect(resolveBoolean('yes')).toEqual(Result.ok(true));
	});

	test('GIVEN a falsy value THEN returns false', () => {
		expect(resolveBoolean('false')).toEqual(Result.ok(false));
		expect(resolveBoolean('0')).toEqual(Result.ok(false));
		expect(resolveBoolean('-')).toEqual(Result.ok(false));
		expect(resolveBoolean('no')).toEqual(Result.ok(false));
	});

	test('GIVEN a truthy value with custom ones THEN returns true', () => {
		expect(resolveBoolean('yay', { truths: ['yay'] })).toEqual(Result.ok(true));
		expect(resolveBoolean('yup', { truths: ['yay', 'yup', 'yop'] })).toEqual(Result.ok(true));
	});

	test('GIVEN a falsy value with custom ones THEN returns false', () => {
		expect(resolveBoolean('nah', { falses: ['nah'] })).toEqual(Result.ok(false));
		expect(resolveBoolean('nope', { falses: ['nah', 'nope', 'noooo'] })).toEqual(Result.ok(false));
	});

	test('GIVEN an invalid values THEN returns error', () => {
		expect(resolveBoolean('hello')).toEqual(Result.err(Identifiers.ArgumentBooleanError));
		expect(resolveBoolean('world', { truths: ['nah', 'nope', 'noooo'] })).toEqual(Result.err(Identifiers.ArgumentBooleanError));
	});
});
