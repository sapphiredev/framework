import { Identifiers, Resolvers } from '../../src';

describe('String resolver tests', () => {
	test('GIVEN a valid string THEN returns it', () => {
		const resolvedString = Resolvers.resolveString('hello');
		expect(resolvedString.isOk()).toBe(true);
		expect(resolvedString.unwrapErr).toThrowError();
		expect(resolvedString.unwrap()).toBe('hello');

		const resolvedNumber = Resolvers.resolveString('100');
		expect(resolvedNumber.isOk()).toBe(true);
		expect(resolvedNumber.unwrapErr).toThrowError();
		expect(resolvedNumber.unwrap()).toBe('100');
	});
	test('GIVEN a valid string with minimum THEN returns it', () => {
		const resolvedString = Resolvers.resolveString('hello', { minimum: 2 });
		expect(resolvedString.isOk()).toBe(true);
		expect(resolvedString.unwrapErr).toThrowError();
		expect(resolvedString.unwrap()).toBe('hello');

		const resolvedNumber = Resolvers.resolveString('100', { minimum: 2 });
		expect(resolvedNumber.isOk()).toBe(true);
		expect(resolvedNumber.unwrapErr).toThrowError();
		expect(resolvedNumber.unwrap()).toBe('100');
	});
	test('GIVEN a valid string with maximum THEN returns its parsed value', () => {
		const resolvedString = Resolvers.resolveString('hello', { maximum: 10 });
		expect(resolvedString.isOk()).toBe(true);
		expect(resolvedString.unwrapErr).toThrowError();
		expect(resolvedString.unwrap()).toBe('hello');

		const resolvedNumber = Resolvers.resolveString('100', { maximum: 100 });
		expect(resolvedNumber.isOk()).toBe(true);
		expect(resolvedNumber.unwrapErr).toThrowError();
		expect(resolvedNumber.unwrap()).toBe('100');
	});
	test('GIVEN a string shorter than minimum THEN returns error', () => {
		const resolvedString = Resolvers.resolveString('hello', { minimum: 10 });
		expect(resolvedString.isOk()).toBe(false);
		expect(resolvedString.unwrap).toThrowError();
		expect(resolvedString.unwrapErr()).toBe(Identifiers.ArgumentStringTooShort);

		const resolvedNumber = Resolvers.resolveString('100', { minimum: 10 });
		expect(resolvedNumber.isOk()).toBe(false);
		expect(resolvedNumber.unwrap).toThrowError();
		expect(resolvedNumber.unwrapErr()).toBe(Identifiers.ArgumentStringTooShort);
	});
	test('GIVEN a string longer than maximum THEN returns error', () => {
		const resolvedString = Resolvers.resolveString('hello', { maximum: 2 });
		expect(resolvedString.isOk()).toBe(false);
		expect(resolvedString.unwrap).toThrowError();
		expect(resolvedString.unwrapErr()).toBe(Identifiers.ArgumentStringTooLong);

		const resolvedNumber = Resolvers.resolveString('100', { maximum: 2 });
		expect(resolvedNumber.isOk()).toBe(false);
		expect(resolvedNumber.unwrap).toThrowError();
		expect(resolvedNumber.unwrapErr()).toBe(Identifiers.ArgumentStringTooLong);
	});
});
