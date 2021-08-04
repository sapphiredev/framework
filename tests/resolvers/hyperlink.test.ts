import { URL } from 'url';
import { Identifiers, Resolvers } from '../../src';

const STRING_URL = 'https://github.com/sapphiredev';
const PARSED_URL = new URL(STRING_URL);

describe('Hyperlink resolver tests', () => {
	test('GIVEN a valid hyperlink THEN returns its parsed value', () => {
		const resolvedHyperlink = Resolvers.resolveHyperlink(STRING_URL);
		expect(resolvedHyperlink.success).toBe(true);
		expect(resolvedHyperlink.error).toBeUndefined();
		expect(resolvedHyperlink.value).toMatchObject(PARSED_URL);
	});
	test('GIVEN an invalid hyperlink THEN returns error', () => {
		const resolvedHyperlink = Resolvers.resolveHyperlink('hello');
		expect(resolvedHyperlink.success).toBe(false);
		expect(resolvedHyperlink.value).toBeUndefined();
		expect(resolvedHyperlink.error).toBe(Identifiers.ArgumentHyperlinkError);
	});
});
