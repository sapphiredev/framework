import { Identifiers, Resolvers } from '../../src';

describe('Number resolver tests', () => {
	test('GIVEN a valid number THEN returns its parsed value', () => {
		const resolvedDecimalNumber = Resolvers.resolveNumber('1.23');
		expect(resolvedDecimalNumber.isOk()).toBe(true);
		expect(resolvedDecimalNumber.unwrapErr).toThrowError();
		expect(resolvedDecimalNumber.unwrap()).toBe(1.23);

		const resolvedWholeNumber = Resolvers.resolveNumber('1');
		expect(resolvedWholeNumber.isOk()).toBe(true);
		expect(resolvedWholeNumber.unwrapErr).toThrowError();
		expect(resolvedWholeNumber.unwrap()).toBe(1);
	});
	test('GIVEN a valid number with minimum THEN returns its parsed value', () => {
		const resolvedDecimalNumber = Resolvers.resolveNumber('2.34', { minimum: 2 });
		expect(resolvedDecimalNumber.isOk()).toBe(true);
		expect(resolvedDecimalNumber.unwrapErr).toThrowError();
		expect(resolvedDecimalNumber.unwrap()).toBe(2.34);

		const resolvedWholeNumber = Resolvers.resolveNumber('2', { minimum: 2 });
		expect(resolvedWholeNumber.isOk()).toBe(true);
		expect(resolvedWholeNumber.unwrapErr).toThrowError();
		expect(resolvedWholeNumber.unwrap()).toBe(2);
	});
	test('GIVEN a valid number with maximum THEN returns its parsed value', () => {
		const resolvedDecimalNumber = Resolvers.resolveNumber('3.45', { maximum: 4 });
		expect(resolvedDecimalNumber.isOk()).toBe(true);
		expect(resolvedDecimalNumber.unwrapErr).toThrowError();
		expect(resolvedDecimalNumber.unwrap()).toBe(3.45);

		const resolvedWholeNumber = Resolvers.resolveNumber('3', { maximum: 4 });
		expect(resolvedWholeNumber.isOk()).toBe(true);
		expect(resolvedWholeNumber.unwrapErr).toThrowError();
		expect(resolvedWholeNumber.unwrap()).toBe(3);
	});
	test('GIVEN a number smaller than minimum THEN returns error', () => {
		const resolvedDecimalNumber = Resolvers.resolveNumber('1.23', { minimum: 2 });
		expect(resolvedDecimalNumber.isOk()).toBe(false);
		expect(resolvedDecimalNumber.unwrap).toThrowError();
		expect(resolvedDecimalNumber.unwrapErr()).toBe(Identifiers.ArgumentNumberTooSmall);

		const resolvedWholeNumber = Resolvers.resolveNumber('1', { minimum: 2 });
		expect(resolvedWholeNumber.isOk()).toBe(false);
		expect(resolvedWholeNumber.unwrap).toThrowError();
		expect(resolvedWholeNumber.unwrapErr()).toBe(Identifiers.ArgumentNumberTooSmall);
	});
	test('GIVEN a number larger than maximum THEN returns error', () => {
		const resolvedDecimalNumber = Resolvers.resolveNumber('4.56', { maximum: 4 });
		expect(resolvedDecimalNumber.isOk()).toBe(false);
		expect(resolvedDecimalNumber.unwrap).toThrowError();
		expect(resolvedDecimalNumber.unwrapErr()).toBe(Identifiers.ArgumentNumberTooLarge);

		const resolvedWholeNumber = Resolvers.resolveNumber('5', { maximum: 4 });
		expect(resolvedWholeNumber.isOk()).toBe(false);
		expect(resolvedWholeNumber.unwrap).toThrowError();
		expect(resolvedWholeNumber.unwrapErr()).toBe(Identifiers.ArgumentNumberTooLarge);
	});
	test('GIVEN an invalid number THEN returns error', () => {
		const resolvedDecimalNumber = Resolvers.resolveNumber('hello');
		expect(resolvedDecimalNumber.isOk()).toBe(false);
		expect(resolvedDecimalNumber.unwrap).toThrowError();
		expect(resolvedDecimalNumber.unwrapErr()).toBe(Identifiers.ArgumentNumberError);
	});
});
