import { Identifiers, Resolvers } from '../../src';

describe('Number resolver tests', () => {
	test('GIVEN a valid number THEN returns its parsed value', () => {
		const resolvedDecimalNumber = Resolvers.resolveNumber('1.23');
		expect(resolvedDecimalNumber.success).toBe(true);
		expect(resolvedDecimalNumber.error).toBeUndefined();
		expect(resolvedDecimalNumber.value).toBe(1.23);

		const resolvedWholeNumber = Resolvers.resolveNumber('1');
		expect(resolvedWholeNumber.success).toBe(true);
		expect(resolvedWholeNumber.error).toBeUndefined();
		expect(resolvedWholeNumber.value).toBe(1);
	});
	test('GIVEN a valid number with minimum THEN returns its parsed value', () => {
		const resolvedDecimalNumber = Resolvers.resolveNumber('2.34', { minimum: 2 });
		expect(resolvedDecimalNumber.success).toBe(true);
		expect(resolvedDecimalNumber.error).toBeUndefined();
		expect(resolvedDecimalNumber.value).toBe(2.34);

		const resolvedWholeNumber = Resolvers.resolveNumber('2', { minimum: 2 });
		expect(resolvedWholeNumber.success).toBe(true);
		expect(resolvedWholeNumber.error).toBeUndefined();
		expect(resolvedWholeNumber.value).toBe(2);
	});
	test('GIVEN a valid number with maximum THEN returns its parsed value', () => {
		const resolvedDecimalNumber = Resolvers.resolveNumber('3.45', { maximum: 4 });
		expect(resolvedDecimalNumber.success).toBe(true);
		expect(resolvedDecimalNumber.error).toBeUndefined();
		expect(resolvedDecimalNumber.value).toBe(3.45);

		const resolvedWholeNumber = Resolvers.resolveNumber('3', { maximum: 4 });
		expect(resolvedWholeNumber.success).toBe(true);
		expect(resolvedWholeNumber.error).toBeUndefined();
		expect(resolvedWholeNumber.value).toBe(3);
	});
	test('GIVEN a number smaller than minimum THEN returns error', () => {
		const resolvedDecimalNumber = Resolvers.resolveNumber('1.23', { minimum: 2 });
		expect(resolvedDecimalNumber.success).toBe(false);
		expect(resolvedDecimalNumber.value).toBeUndefined();
		expect(resolvedDecimalNumber.error).toBe(Identifiers.ArgumentNumberTooSmall);

		const resolvedWholeNumber = Resolvers.resolveNumber('1', { minimum: 2 });
		expect(resolvedWholeNumber.success).toBe(false);
		expect(resolvedWholeNumber.value).toBeUndefined();
		expect(resolvedWholeNumber.error).toBe(Identifiers.ArgumentNumberTooSmall);
	});
	test('GIVEN a number larger than maximum THEN returns error', () => {
		const resolvedDecimalNumber = Resolvers.resolveNumber('4.56', { maximum: 4 });
		expect(resolvedDecimalNumber.success).toBe(false);
		expect(resolvedDecimalNumber.value).toBeUndefined();
		expect(resolvedDecimalNumber.error).toBe(Identifiers.ArgumentNumberTooLarge);

		const resolvedWholeNumber = Resolvers.resolveNumber('5', { maximum: 4 });
		expect(resolvedWholeNumber.success).toBe(false);
		expect(resolvedWholeNumber.value).toBeUndefined();
		expect(resolvedWholeNumber.error).toBe(Identifiers.ArgumentNumberTooLarge);
	});
	test('GIVEN an invalid number THEN returns error', () => {
		const resolvedDecimalNumber = Resolvers.resolveNumber('hello');
		expect(resolvedDecimalNumber.success).toBe(false);
		expect(resolvedDecimalNumber.value).toBeUndefined();
		expect(resolvedDecimalNumber.error).toBe(Identifiers.ArgumentNumberError);
	});
});
