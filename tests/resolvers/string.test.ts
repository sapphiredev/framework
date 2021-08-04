import { Identifiers, Resolvers } from '../../src';

describe('String resolver tests', () => {
	test('GIVEN a valid string THEN returns it', () => {
		const resolvedString = Resolvers.resolveString('hello');
		expect(resolvedString.success).toBe(true);
		expect(resolvedString.error).toBeUndefined();
		expect(resolvedString.value).toBe('hello');

		const resolvedNumber = Resolvers.resolveString('100');
		expect(resolvedNumber.success).toBe(true);
		expect(resolvedNumber.error).toBeUndefined();
		expect(resolvedNumber.value).toBe('100');
	});
	test('GIVEN a valid string with minimum THEN returns it', () => {
		const resolvedString = Resolvers.resolveString('hello', { minimum: 2 });
		expect(resolvedString.success).toBe(true);
		expect(resolvedString.error).toBeUndefined();
		expect(resolvedString.value).toBe('hello');

		const resolvedNumber = Resolvers.resolveString('100', { minimum: 2 });
		expect(resolvedNumber.success).toBe(true);
		expect(resolvedNumber.error).toBeUndefined();
		expect(resolvedNumber.value).toBe('100');
	});
	test('GIVEN a valid string with maximum THEN returns its parsed value', () => {
		const resolvedString = Resolvers.resolveString('hello', { maximum: 10 });
		expect(resolvedString.success).toBe(true);
		expect(resolvedString.error).toBeUndefined();
		expect(resolvedString.value).toBe('hello');

		const resolvedNumber = Resolvers.resolveString('100', { maximum: 100 });
		expect(resolvedNumber.success).toBe(true);
		expect(resolvedNumber.error).toBeUndefined();
		expect(resolvedNumber.value).toBe('100');
	});
	test('GIVEN a string shorter than minimum THEN returns error', () => {
		const resolvedString = Resolvers.resolveString('hello', { minimum: 10 });
		expect(resolvedString.success).toBe(false);
		expect(resolvedString.value).toBeUndefined();
		expect(resolvedString.error).toBe(Identifiers.ArgumentStringTooShort);

		const resolvedNumber = Resolvers.resolveString('100', { minimum: 10 });
		expect(resolvedNumber.success).toBe(false);
		expect(resolvedNumber.value).toBeUndefined();
		expect(resolvedNumber.error).toBe(Identifiers.ArgumentStringTooShort);
	});
	test('GIVEN a string longer than maximum THEN returns error', () => {
		const resolvedString = Resolvers.resolveString('hello', { maximum: 2 });
		expect(resolvedString.success).toBe(false);
		expect(resolvedString.value).toBeUndefined();
		expect(resolvedString.error).toBe(Identifiers.ArgumentStringTooLong);

		const resolvedNumber = Resolvers.resolveString('100', { maximum: 2 });
		expect(resolvedNumber.success).toBe(false);
		expect(resolvedNumber.value).toBeUndefined();
		expect(resolvedNumber.error).toBe(Identifiers.ArgumentStringTooLong);
	});
});
