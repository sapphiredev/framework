import { URL } from 'url';
import { Identifiers, Resolvers, Result } from '../../src';

const STRING_URL = 'https://github.com/sapphiredev';
const PARSED_URL = new URL(STRING_URL);

describe('Hyperlink resolver tests', () => {
	test('GIVEN a valid hyperlink THEN returns its parsed value', () => {
		expect(Resolvers.resolveHyperlink(STRING_URL)).toEqual(Result.ok(PARSED_URL));
	});
	test('GIVEN an invalid hyperlink THEN returns error', () => {
		expect(Resolvers.resolveHyperlink('hello')).toEqual(Result.err(Identifiers.ArgumentHyperlinkError));
	});
});
