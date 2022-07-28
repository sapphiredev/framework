import { Identifiers, Resolvers, Result } from '../../src';

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
		expect(Resolvers.resolveDate(DATE_2020_PLAIN_STRING)).toEqual(Result.ok(DATE_2020));
	});
	test('GIVEN a valid date-time with minimum THEN returns the associated timestamp', () => {
		expect(Resolvers.resolveDate(DATE_2022_PLAIN_STRING, MINIMUM)).toEqual(Result.ok(DATE_2022));
	});
	test('GIVEN a valid date-time with maximum THEN returns the associated timestamp', () => {
		expect(Resolvers.resolveDate(DATE_2018_PLAIN_STRING, MAXIMUM)).toEqual(Result.ok(DATE_2018));
	});
	test('GIVEN a date-time before minimum THEN returns error', () => {
		expect(Resolvers.resolveDate(DATE_2018_PLAIN_STRING, MINIMUM)).toEqual(Result.err(Identifiers.ArgumentDateTooEarly));
	});
	test('GIVEN a date-time beyond maximum THEN returns error', () => {
		expect(Resolvers.resolveDate(DATE_2022_PLAIN_STRING, MAXIMUM)).toEqual(Result.err(Identifiers.ArgumentDateTooFar));
	});
	test('GIVEN an invalid date THEN returns error', () => {
		expect(Resolvers.resolveDate('hello')).toEqual(Result.err(Identifiers.ArgumentDateError));
	});
});
