import { Identifiers, Resolvers } from '../../src';

const DATE_2018_PLAIN_STRING = 'August 11, 2018 00:00:00';
const DATE_2018 = new Date(DATE_2018_PLAIN_STRING);

const DATE_2020_PLAIN_STRING = 'August 11, 2020 00:00:00';
const DATE_2020 = new Date(DATE_2020_PLAIN_STRING);

const DATE_2022_PLAIN_STRING = 'August 11, 2022 00:00:00';
const DATE_2022 = new Date(DATE_2022_PLAIN_STRING);

const MINIMUM = { minimum: new Date('August 11, 2019 00:00:00').getTime() };
const MAXIMUM = { maximum: new Date('August 11, 2021 00:00:00').getTime() };

describe('Date resolver tests', () => {
	test('GIVEN a valid date-time THEN returns the associated timestamp', () => {
		const resolvedDate = Resolvers.resolveDate(DATE_2020_PLAIN_STRING);
		expect(resolvedDate.success).toBe(true);
		expect(resolvedDate.error).toBeUndefined();
		expect(resolvedDate.value?.getTime()).toBe(DATE_2020.getTime());
	});
	test('GIVEN a valid date-time with minimum THEN returns the associated timestamp', () => {
		const resolvedDate = Resolvers.resolveDate(DATE_2022_PLAIN_STRING, MINIMUM);
		expect(resolvedDate.success).toBe(true);
		expect(resolvedDate.error).toBeUndefined();
		expect(resolvedDate.value?.getTime()).toBe(DATE_2022.getTime());
	});
	test('GIVEN a valid date-time with maximum THEN returns the associated timestamp', () => {
		const resolvedDate = Resolvers.resolveDate(DATE_2018_PLAIN_STRING, MAXIMUM);
		expect(resolvedDate.success).toBe(true);
		expect(resolvedDate.error).toBeUndefined();
		expect(resolvedDate.value?.getTime()).toBe(DATE_2018.getTime());
	});
	test('GIVEN a date-time before minimum THEN returns error', () => {
		const resolvedDate = Resolvers.resolveDate(DATE_2018_PLAIN_STRING, MINIMUM);
		expect(resolvedDate.success).toBe(false);
		expect(resolvedDate.value).toBeUndefined();
		expect(resolvedDate.error).toBe(Identifiers.ArgumentDateTooEarly);
	});
	test('GIVEN a date-time beyond maximum THEN returns error', () => {
		const resolvedDate = Resolvers.resolveDate(DATE_2022_PLAIN_STRING, MAXIMUM);
		expect(resolvedDate.success).toBe(false);
		expect(resolvedDate.value).toBeUndefined();
		expect(resolvedDate.error).toBe(Identifiers.ArgumentDateTooFar);
	});
	test('GIVEN an invalid date THEN returns error', () => {
		const resolvedDate = Resolvers.resolveDate('hello');
		expect(resolvedDate.success).toBe(false);
		expect(resolvedDate.value).toBeUndefined();
		expect(resolvedDate.error).toBe(Identifiers.ArgumentDateError);
	});
});
