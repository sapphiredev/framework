import { Identifiers, Resolvers } from '../../src';

describe('Boolean resolver tests', () => {
	test('GIVEN a truthy value THEN returns true', () => {
		expect(Resolvers.resolveBoolean('true').isOk()).toBe(true);
		expect(Resolvers.resolveBoolean('true').unwrapErr).toThrowError();

		expect(Resolvers.resolveBoolean('true').unwrap()).toBe(true);
		expect(Resolvers.resolveBoolean('1').unwrap()).toBe(true);
		expect(Resolvers.resolveBoolean('+').unwrap()).toBe(true);
		expect(Resolvers.resolveBoolean('yes').unwrap()).toBe(true);
	});
	test('GIVEN a falsy value THEN returns false', () => {
		expect(Resolvers.resolveBoolean('false').isOk()).toBe(true);
		expect(Resolvers.resolveBoolean('false').unwrapErr).toThrowError();

		expect(Resolvers.resolveBoolean('false').unwrap()).toBe(false);
		expect(Resolvers.resolveBoolean('0').unwrap()).toBe(false);
		expect(Resolvers.resolveBoolean('-').unwrap()).toBe(false);
		expect(Resolvers.resolveBoolean('no').unwrap()).toBe(false);
	});
	test('GIVEN a truthy value with custom ones THEN returns true', () => {
		expect(Resolvers.resolveBoolean('yay', { truths: ['yay'] }).isOk()).toBe(true);
		expect(Resolvers.resolveBoolean('yay', { truths: ['yay'] }).unwrapErr).toThrowError();

		expect(Resolvers.resolveBoolean('yay', { truths: ['yay'] }).unwrap()).toBe(true);
		expect(Resolvers.resolveBoolean('yup', { truths: ['yay', 'yup', 'yop'] }).unwrap()).toBe(true);
	});
	test('GIVEN a falsy value with custom ones THEN returns false', () => {
		expect(Resolvers.resolveBoolean('nah', { falses: ['nah'] }).isOk()).toBe(true);
		expect(Resolvers.resolveBoolean('nah', { falses: ['nah'] }).unwrapErr).toThrowError();

		expect(Resolvers.resolveBoolean('nah', { falses: ['nah'] }).unwrap()).toBe(false);
		expect(Resolvers.resolveBoolean('nope', { falses: ['nah', 'nope', 'noooo'] }).unwrap()).toBe(false);
	});
	test('GIVEN an invalid values THEN returns error', () => {
		expect(Resolvers.resolveBoolean('hello').isOk()).toBe(false);
		expect(Resolvers.resolveBoolean('hello').unwrap).toThrowError();

		expect(Resolvers.resolveBoolean('hello').unwrapErr()).toBe(Identifiers.ArgumentBooleanError);
		expect(Resolvers.resolveBoolean('world', { truths: ['nah', 'nope', 'noooo'] }).unwrapErr()).toBe(Identifiers.ArgumentBooleanError);
	});
});
