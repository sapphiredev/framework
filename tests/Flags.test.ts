import { Lexer, Parser } from 'lexure';
import { FlagStrategy } from '../src/lib/utils/strategies/FlagUnorderedStrategy';

const parse = (testString: string) => {
	return new Parser(
		new Lexer(testString)
			.setQuotes([
				['"', '"'],
				['“', '”'],
				['「', '」']
			])
			.lex()
	)
		.setUnorderedStrategy(new FlagStrategy(['f', 'hello']))
		.parse();
};

describe('Flag parsing strategy', () => {
	test('GIVEN signle-hypen flag RETURNS flag', () => {
		const { flags, options } = parse('-f');
		expect(flags.size).toBe(1);
		expect([...flags]).toStrictEqual(['f']);
		expect(options.size).toBe(0);
	});

	test('GIVEN signle-hypen flag inside text RETURNS flag', () => {
		const { flags, options } = parse('commit "hello there" -f');
		expect(flags.size).toBe(1);
		expect([...flags]).toStrictEqual(['f']);
		expect(options.size).toBe(0);
	});

	test('GIVEN double-hyphen option without value RETURNS flag', () => {
		const { flags, options } = parse('--hello');
		expect(flags.size).toBe(1);
		expect([...flags]).toStrictEqual(['hello']);
		expect(options.size).toBe(0);
	});
	test('GIVEN double-hyphen option without value inside text RETURNS flag', () => {
		const { flags, options } = parse('mention --hello');
		expect(flags.size).toBe(1);
		expect([...flags]).toStrictEqual(['hello']);
		expect(options.size).toBe(0);
	});

	test('GIVEN double-hyphen option with value RETURNS option', () => {
		const { flags, options } = parse('--hello=world');
		expect(flags.size).toBe(0);
		expect(options.size).toBe(1);
		expect(options.has('hello')).toBe(true);
		expect(options.get('hello')).toStrictEqual(['world']);
	});

	test('GIVEN double-hyphen option inside text with value RETURNS option', () => {
		const { flags, options } = parse('command --hello=world');
		expect(flags.size).toBe(0);
		expect(options.size).toBe(1);
		expect(options.has('hello')).toBe(true);
		expect(options.get('hello')).toStrictEqual(['world']);
	});

	test('GIVEN double-hyphen option with multiple occurences inside text with value RETURNS option with multiple values', () => {
		const { flags, options } = parse('command --hello=world --hello=sammy');
		expect(flags.size).toBe(0);
		expect(options.size).toBe(1);
		expect(options.has('hello')).toBe(true);
		expect(options.get('hello')).toStrictEqual(['world', 'sammy']);
	});
	test('GIVEN signle-hypen multiple-character flag RETURNS nothing', () => {
		const { flags, options } = parse('-flags');
		expect(flags.size).toBe(0);
		expect(options.size).toBe(0);
	});

	test('GIVEN signle-hypen flag inside quotes RETURNS nothing', () => {
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
