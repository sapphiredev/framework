import { Result } from '@sapphire/result';
import { URL } from 'node:url';
import { Identifiers } from '../../src/lib/errors/Identifiers';
import { resolveHyperlink } from '../../src/lib/resolvers/hyperlink';

const STRING_URL = 'https://github.com/sapphiredev';
const PARSED_URL = new URL(STRING_URL);

describe('Hyperlink resolver tests', () => {
	test('GIVEN a valid hyperlink THEN returns its parsed value', () => {
		expect(resolveHyperlink(STRING_URL)).toEqual(Result.ok(PARSED_URL));
	});
	test('GIVEN an invalid hyperlink THEN returns error', () => {
		expect(resolveHyperlink('hello')).toEqual(Result.err(Identifiers.ArgumentHyperlinkError));
	});
});
