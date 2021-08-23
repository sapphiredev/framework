import { Identifiers, Resolvers } from '../../src';

describe('Float resolver tests', () => {
	test('GIVEN a valid float THEN returns its parsed value', () => {
		const resolvedFloat = Resolvers.resolveFloat('1.23');
		expect(resolvedFloat.success).toBe(true);
		expect(resolvedFloat.error).toBeUndefined();
		expect(resolvedFloat.value).toBe(1.23);
	});
	test('GIVEN a valid float with minimum THEN returns its parsed value', () => {
		const resolvedFloat = Resolvers.resolveFloat('2.34', { minimum: 2 });
		expect(resolvedFloat.success).toBe(true);
		expect(resolvedFloat.error).toBeUndefined();
		expect(resolvedFloat.value).toBe(2.34);
	});
	test('GIVEN a valid float with maximum THEN returns its parsed value', () => {
		const resolvedFloat = Resolvers.resolveFloat('3.45', { maximum: 4 });
		expect(resolvedFloat.success).toBe(true);
		expect(resolvedFloat.error).toBeUndefined();
		expect(resolvedFloat.value).toBe(3.45);
	});
	test('GIVEN a float before minimum THEN returns error', () => {
		const resolvedFloat = Resolvers.resolveFloat('1.23', { minimum: 2 });
		expect(resolvedFloat.success).toBe(false);
		expect(resolvedFloat.value).toBeUndefined();
		expect(resolvedFloat.error).toBe(Identifiers.ArgumentFloatTooSmall);
	});
	test('GIVEN a float beyond maximum THEN returns error', () => {
		const resolvedFloat = Resolvers.resolveFloat('4.56', { maximum: 4 });
		expect(resolvedFloat.success).toBe(false);
		expect(resolvedFloat.value).toBeUndefined();
		expect(resolvedFloat.error).toBe(Identifiers.ArgumentFloatTooLarge);
	});
	test('GIVEN an invalid float THEN returns error', () => {
		const resolvedFloat = Resolvers.resolveFloat('hello');
		expect(resolvedFloat.success).toBe(false);
		expect(resolvedFloat.value).toBeUndefined();
		expect(resolvedFloat.error).toBe(Identifiers.ArgumentFloatError);
	});
});
