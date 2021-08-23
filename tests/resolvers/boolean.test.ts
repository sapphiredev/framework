import { Identifiers, Resolvers } from '../../src';

describe('Boolean resolver tests', () => {
	test('GIVEN a truthy value THEN returns true', () => {
		expect(Resolvers.resolveBoolean('true').success).toBe(true);
		expect(Resolvers.resolveBoolean('true').error).toBeUndefined();

		expect(Resolvers.resolveBoolean('true').value).toBe(true);
		expect(Resolvers.resolveBoolean('1').value).toBe(true);
		expect(Resolvers.resolveBoolean('+').value).toBe(true);
		expect(Resolvers.resolveBoolean('yes').value).toBe(true);
	});
	test('GIVEN a falsy value THEN returns false', () => {
		expect(Resolvers.resolveBoolean('false').success).toBe(true);
		expect(Resolvers.resolveBoolean('false').error).toBeUndefined();

		expect(Resolvers.resolveBoolean('false').value).toBe(false);
		expect(Resolvers.resolveBoolean('0').value).toBe(false);
		expect(Resolvers.resolveBoolean('-').value).toBe(false);
		expect(Resolvers.resolveBoolean('no').value).toBe(false);
	});
	test('GIVEN a truthy value with custom ones THEN returns true', () => {
		expect(Resolvers.resolveBoolean('yay', { truths: ['yay'] }).success).toBe(true);
		expect(Resolvers.resolveBoolean('yay', { truths: ['yay'] }).error).toBeUndefined();

		expect(Resolvers.resolveBoolean('yay', { truths: ['yay'] }).value).toBe(true);
		expect(Resolvers.resolveBoolean('yup', { truths: ['yay', 'yup', 'yop'] }).value).toBe(true);
	});
	test('GIVEN a falsy value with custom ones THEN returns false', () => {
		expect(Resolvers.resolveBoolean('nah', { falses: ['nah'] }).success).toBe(true);
		expect(Resolvers.resolveBoolean('nah', { falses: ['nah'] }).error).toBeUndefined();

		expect(Resolvers.resolveBoolean('nah', { falses: ['nah'] }).value).toBe(false);
		expect(Resolvers.resolveBoolean('nope', { falses: ['nah', 'nope', 'noooo'] }).value).toBe(false);
	});
	test('GIVEN an invalid values THEN returns error', () => {
		expect(Resolvers.resolveBoolean('hello').success).toBe(false);
		expect(Resolvers.resolveBoolean('hello').value).toBeUndefined();

		expect(Resolvers.resolveBoolean('hello').error).toBe(Identifiers.ArgumentBooleanError);
		expect(Resolvers.resolveBoolean('world', { truths: ['nah', 'nope', 'noooo'] }).error).toBe(Identifiers.ArgumentBooleanError);
	});
});
