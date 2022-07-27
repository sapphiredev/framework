import { URL } from 'url';
import { Identifiers, Resolvers } from '../../src';

const STRING_URL = 'https://github.com/sapphiredev';
const PARSED_URL = new URL(STRING_URL);

describe('Hyperlink resolver tests', () => {
	test('GIVEN a valid hyperlink THEN returns its parsed value', () => {
		const resolvedHyperlink = Resolvers.resolveHyperlink(STRING_URL);
		expect(resolvedHyperlink.isOk()).toBe(true);
		expect(resolvedHyperlink.unwrapErr).toThrowError();
		expect(resolvedHyperlink.unwrap()).toMatchObject(PARSED_URL);
	});
	test('GIVEN an invalid hyperlink THEN returns error', () => {
		const resolvedHyperlink = Resolvers.resolveHyperlink('hello');
		expect(resolvedHyperlink.isOk()).toBe(false);
		expect(resolvedHyperlink.unwrap).toThrowError();
		expect(resolvedHyperlink.unwrapErr()).toBe(Identifiers.ArgumentHyperlinkError);
	});
});
