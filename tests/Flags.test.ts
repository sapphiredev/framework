import { Lexer, Parser } from 'lexure';
import { FlagUnorderedStrategy } from '../src/lib/utils/strategies/FlagUnorderedStrategy';

const parse = (testString: string) =>
	new Parser(
		new Lexer(testString)
			.setQuotes([
				['"', '"'],
				['“', '”'],
				['「', '」']
			])
			.lex()
	)
		.setUnorderedStrategy(new FlagUnorderedStrategy({ flags: ['f', 'hello'], options: ['o', 'option'] }))
		.parse();

describe('Flag parsing strategy', () => {
	test('GIVEN typeof FlagStrategy RETURNS function', () => {
		expect(typeof FlagUnorderedStrategy).toBe('function');
	});
	test('GIVEN value-less flag RETURNS flag', () => {
		const { flags, options } = parse('-f');
		expect(flags.size).toBe(1);
		expect([...flags]).toStrictEqual(['f']);
		expect(options.size).toBe(0);
	});

	test('GIVEN value-less flag inside text RETURNS flag', () => {
		const { flags, options } = parse('commit "hello there" -f');
		expect(flags.size).toBe(1);
		expect([...flags]).toStrictEqual(['f']);
		expect(options.size).toBe(0);
	});

	test('GIVEN flag with value RETURNS flag', () => {
		const { flags, options } = parse('-f=hi');
		expect(flags.size).toBe(0);
		expect(options.size).toBe(0);
	});

	test('GIVEN flag with value inside text RETURNS flag', () => {
		const { flags, options } = parse('commit "hello there" -f=hi');
		expect(flags.size).toBe(0);
		expect(options.size).toBe(0);
	});

	test('GIVEN option with value RETURNS option', () => {
		const { flags, options } = parse('--option=world');
		expect(flags.size).toBe(0);
		expect(options.size).toBe(1);
		expect(options.has('option')).toBe(true);
		expect(options.get('option')).toStrictEqual(['world']);
	});

	test('GIVEN option with value inside text RETURNS option', () => {
		const { flags, options } = parse('command --option=world');
		expect(flags.size).toBe(0);
		expect(options.size).toBe(1);
		expect(options.has('option')).toBe(true);
		expect(options.get('option')).toStrictEqual(['world']);
	});

	test('GIVEN double-hyphen option with multiple occurences inside text with value RETURNS option with multiple values', () => {
		const { flags, options } = parse('command --option=world --option=sammy');
		expect(flags.size).toBe(0);
		expect(options.size).toBe(1);
		expect(options.has('option')).toBe(true);
		expect(options.get('option')).toStrictEqual(['world', 'sammy']);
	});

	test('GIVEN single-hypen flag inside quotes RETURNS nothing', () => {
		const { flags, options } = parse('commit "hello there -f"');
		expect(flags.size).toBe(0);
		expect(options.size).toBe(0);
	});

	test('GIVEN double-hyphen option without value inside quote RETURNS nothing', () => {
		const { flags, options } = parse('mention "try --hello"');
		expect(flags.size).toBe(0);
		expect(options.size).toBe(0);
	});
});
