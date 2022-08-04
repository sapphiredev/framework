import { Lexer, Parser } from '@sapphire/lexure';
import { FlagUnorderedStrategy } from '../src/lib/utils/strategies/FlagUnorderedStrategy';

const parse = (testString: string) =>
	new Parser(new FlagUnorderedStrategy({ flags: ['f', 'hello'], options: ['o', 'option'] })).run(
		new Lexer({
			quotes: [
				['"', '"'],
				['“', '”'],
				['「', '」'],
				['«', '»']
			]
		}).run(testString)
	);

describe('Flag parsing strategy', () => {
	test('GIVEN typeof FlagStrategy THEN returns function', () => {
		expect(typeof FlagUnorderedStrategy).toBe('function');
	});
	test('GIVEN flag without value THEN returns flag', () => {
		const { flags, options } = parse('-f');
		expect(flags.size).toBe(1);
		expect([...flags]).toStrictEqual(['f']);
		expect(options.size).toBe(0);
	});

	test('GIVEN flag without value inside text THEN returns flag', () => {
		const { flags, options } = parse('commit "hello there" -f');
		expect(flags.size).toBe(1);
		expect([...flags]).toStrictEqual(['f']);
		expect(options.size).toBe(0);
	});

	test('GIVEN flag with value THEN returns nothing', () => {
		const { flags, options } = parse('-f=hi');
		expect(flags.size).toBe(0);
		expect(options.size).toBe(0);
	});

	test('GIVEN flag with value inside text THEN returns nothing', () => {
		const { flags, options } = parse('commit "hello there" -f=hi');
		expect(flags.size).toBe(0);
		expect(options.size).toBe(0);
	});

	test('GIVEN option with value THEN returns option', () => {
		const { flags, options } = parse('--option=world');
		expect(flags.size).toBe(0);
		expect(options.size).toBe(1);
		expect(options.has('option')).toBe(true);
		expect(options.get('option')).toStrictEqual(['world']);
	});

	test('GIVEN option with value inside text THEN returns option with single value', () => {
		const { flags, options } = parse('command --option=world');
		expect(flags.size).toBe(0);
		expect(options.size).toBe(1);
		expect(options.has('option')).toBe(true);
		expect(options.get('option')).toStrictEqual(['world']);
	});

	test('GIVEN option with multiple occurences inside text THEN returns option with multiple values', () => {
		const { flags, options } = parse('command --option=world --option=sammy');
		expect(flags.size).toBe(0);
		expect(options.size).toBe(1);
		expect(options.has('option')).toBe(true);
		expect(options.get('option')).toStrictEqual(['world', 'sammy']);
	});

	test('GIVEN flag inside quotes THEN returns nothing', () => {
		const { flags, options } = parse('commit "hello there -f"');
		expect(flags.size).toBe(0);
		expect(options.size).toBe(0);
	});

	test('GIVEN option without value inside quote THEN returns nothing', () => {
		const { flags, options } = parse('mention "try --hello"');
		expect(flags.size).toBe(0);
		expect(options.size).toBe(0);
	});
});
