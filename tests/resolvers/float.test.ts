import { Identifiers, Resolvers } from '../../src';

describe('Float resolver tests', () => {
	test('GIVEN a valid float THEN returns its parsed value', () => {
		const resolvedFloat = Resolvers.resolveFloat('1.23');
		expect(resolvedFloat.isOk()).toBe(true);
		expect(resolvedFloat.unwrapErr).toThrowError();
		expect(resolvedFloat.unwrap()).toBe(1.23);
	});
	test('GIVEN a valid float with minimum THEN returns its parsed value', () => {
		const resolvedFloat = Resolvers.resolveFloat('2.34', { minimum: 2 });
		expect(resolvedFloat.isOk()).toBe(true);
		expect(resolvedFloat.unwrapErr).toThrowError();
		expect(resolvedFloat.unwrap()).toBe(2.34);
	});
	test('GIVEN a valid float with maximum THEN returns its parsed value', () => {
		const resolvedFloat = Resolvers.resolveFloat('3.45', { maximum: 4 });
		expect(resolvedFloat.isOk()).toBe(true);
		expect(resolvedFloat.unwrapErr).toThrowError();
		expect(resolvedFloat.unwrap()).toBe(3.45);
	});
	test('GIVEN a float before minimum THEN returns error', () => {
		const resolvedFloat = Resolvers.resolveFloat('1.23', { minimum: 2 });
		expect(resolvedFloat.isOk()).toBe(false);
		expect(resolvedFloat.unwrap).toThrowError();
		expect(resolvedFloat.unwrapErr()).toBe(Identifiers.ArgumentFloatTooSmall);
	});
	test('GIVEN a float beyond maximum THEN returns error', () => {
		const resolvedFloat = Resolvers.resolveFloat('4.56', { maximum: 4 });
		expect(resolvedFloat.isOk()).toBe(false);
		expect(resolvedFloat.unwrap).toThrowError();
		expect(resolvedFloat.unwrapErr()).toBe(Identifiers.ArgumentFloatTooLarge);
	});
	test('GIVEN an invalid float THEN returns error', () => {
		const resolvedFloat = Resolvers.resolveFloat('hello');
		expect(resolvedFloat.isOk()).toBe(false);
		expect(resolvedFloat.unwrap).toThrowError();
		expect(resolvedFloat.unwrapErr()).toBe(Identifiers.ArgumentFloatError);
	});
});
