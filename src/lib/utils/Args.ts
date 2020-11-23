import type { Channel, DMChannel, GuildChannel, GuildMember, Message, NewsChannel, Role, TextChannel, User, VoiceChannel } from 'discord.js';
import type * as Lexure from 'lexure';
import type { URL } from 'url';
import { ArgumentError } from '../errors/ArgumentError';
import { UserError } from '../errors/UserError';
import type { ArgumentContext, IArgument } from '../structures/Argument';
import type { Command } from '../structures/Command';
import { err, isErr, isOk, ok, Ok, Result } from './Result';

/**
 * The argument parser to be used in [[Command]].
 */
export class Args {
	/**
	 * The original message that triggered the command.
	 */
	public readonly message: Message;

	/**
	 * The command that is being run.
	 */
	public readonly command: Command;
	private readonly parser: Lexure.Args;
	private states: Lexure.ArgsState[] = [];

	public constructor(message: Message, command: Command, parser: Lexure.Args) {
		this.message = message;
		this.command = command;
		this.parser = parser;
	}

	/**
	 * Sets the parser to the first token.
	 */
	public start(): Args {
		this.parser.state = {
			usedIndices: new Set(),
			position: 0,
			positionFromEnd: this.parser.parserOutput.ordered.length - 1
		};
		return this;
	}

	/**
	 * Retrieves the next parameter and parses it. Advances index on success.
	 * @param type The type of the argument.
	 * @example
	 * ```typescript
	 * // !square 5
	 * const resolver = Args.make((arg) => {
	 *   const parsed = Number(argument);
	 *   if (Number.isNaN(parsed)) return err(new UserError('ArgumentNumberNaN', 'You must write a valid number.'));
	 *   return ok(parsed);
	 * });
	 * const a = await args.pickResult(resolver);
	 * if (!a.success) throw new UserError('ArgumentNumberNaN', 'You must write a valid number.');
	 *
	 * await message.channel.send(`The result is: ${a.value ** 2}!`);
	 * // Sends "The result is: 25"
	 * ```
	 */
	public async pickResult<T>(type: IArgument<T>, options?: ArgOptions): Promise<Result<T, UserError>>;
	/**
	 * Retrieves the next parameter and parses it. Advances index on success.
	 * @param type The type of the argument.
	 * @example
	 * ```typescript
	 * // !add 1 2
	 * const a = await args.pickResult('integer');
	 * if (!a.success) throw new UserError('AddArgumentError', 'You must write two numbers, but the first one did not match.');
	 *
	 * const b = await args.pickResult('integer');
	 * if (!b.success) throw new UserError('AddArgumentError', 'You must write two numbers, but the second one did not match.');
	 *
	 * await message.channel.send(`The result is: ${a.value + b.value}!`);
	 * // Sends "The result is: 3"
	 * ```
	 */
	public async pickResult<K extends keyof ArgType>(type: K, options?: ArgOptions): Promise<Result<ArgType[K], UserError>>;
	public async pickResult<K extends keyof ArgType>(type: K, options: ArgOptions = {}): Promise<Result<ArgType[K], UserError>> {
		const argument = this.resolveArgument(type);
		if (!argument) return err(new UserError('UnavailableArgument', `The argument "${type as string}" was not found.`));

		const result = await this.parser.singleParseAsync(async (arg) =>
			argument.run(arg, {
				message: this.message,
				command: this.command,
				...options
			})
		);
		if (result === null) return err(new UserError('MissingArguments', 'There are no more arguments.'));
		if (isOk(result)) return result as Ok<ArgType[K]>;
		return result;
	}

	/**
	 * Similar to [[Args.pickResult]] but returns the value on success, throwing otherwise.
	 * @param type The type of the argument.
	 * @example
	 * ```typescript
	 * // !square 5
	 * const resolver = Args.make((arg) => {
	 *   const parsed = Number(argument);
	 *   if (Number.isNaN(parsed)) return err(new UserError('ArgumentNumberNaN', 'You must write a valid number.'));
	 *   return ok(parsed);
	 * });
	 * const a = await args.pick(resolver);
	 *
	 * await message.channel.send(`The result is: ${a ** 2}!`);
	 * // Sends "The result is: 25"
	 * ```
	 */
	public async pick<T>(type: IArgument<T>, options?: ArgOptions): Promise<T>;
	/**
	 * Similar to [[Args.pickResult]] but returns the value on success, throwing otherwise.
	 * @param type The type of the argument.
	 * @example
	 * ```typescript
	 * // !add 1 2
	 * const a = await args.pick('integer');
	 * const b = await args.pick('integer');
	 * await message.channel.send(`The result is: ${a + b}!`);
	 * // Sends "The result is: 3"
	 * ```
	 */
	public async pick<K extends keyof ArgType>(type: K, options?: ArgOptions): Promise<ArgType[K]>;
	public async pick<K extends keyof ArgType>(type: K, options?: ArgOptions): Promise<ArgType[K]> {
		const result = await this.pickResult(type, options);
		if (isOk(result)) return result.value;
		throw result.error;
	}

	/**
	 * Retrieves all the following arguments.
	 * @param type The type of the argument.
	 * @example
	 * ```typescript
	 * // !reverse Hello world!
	 * const resolver = Args.make((arg) => ok(arg.split('').reverse()));
	 * const a = await args.restResult(resolver);
	 * if (!a.success) throw new UserError('AddArgumentError', 'You must write some text.');
	 *
	 * await message.channel.send(`The reversed value is... ${a.value}`);
	 * // Sends "The reversed value is... !dlrow olleH"
	 * ```
	 */
	public async restResult<T>(type: IArgument<T>, options?: ArgOptions): Promise<Result<T, UserError>>;
	/**
	 * Retrieves all the following arguments.
	 * @param type The type of the argument.
	 * @example
	 * ```typescript
	 * // !add 2 Hello World!
	 * const a = await args.pickResult('integer');
	 * if (!a.success) throw new UserError('AddArgumentError', 'You must write a number and a text, but the former did not match.');
	 *
	 * const b = await args.restResult('string', { minimum: 1 });
	 * if (!b.success) throw new UserError('AddArgumentError', 'You must write a number and a text, but the latter did not match.');
	 *
	 * await message.channel.send(`The repeated value is... ${b.value.repeat(a.value)}!`);
	 * // Sends "The repeated value is... Hello World!Hello World!"
	 * ```
	 */
	public async restResult<K extends keyof ArgType>(type: K, options?: ArgOptions): Promise<Result<ArgType[K], UserError>>;
	public async restResult<T>(type: keyof ArgType | IArgument<T>, options: ArgOptions = {}): Promise<Result<unknown, UserError>> {
		const argument = this.resolveArgument(type);
		if (!argument) return err(new UserError('UnavailableArgument', `The argument "${type as string}" was not found.`));

		if (this.parser.finished) return err(new UserError('MissingArguments', 'There are no more arguments.'));

		const state = this.parser.save();
		const data = this.parser.many().reduce((acc, token) => `${acc}${token.value}${token.trailing}`, '');
		const result = await argument.run(data, {
			message: this.message,
			command: this.command,
			...options
		});
		if (isOk(result)) return result;

		this.parser.restore(state);
		return result;
	}

	/**
	 * Similar to [[Args.restResult]] but returns the value on success, throwing otherwise.
	 * @param type The type of the argument.
	 * @example
	 * ```typescript
	 * // !reverse Hello world!
	 * const resolver = Args.make((arg) => ok(arg.split('').reverse()));
	 * const a = await args.rest(resolver);
	 * await message.channel.send(`The reversed value is... ${a}`);
	 * // Sends "The reversed value is... !dlrow olleH"
	 * ```
	 */
	public async rest<T>(type: IArgument<T>, options?: ArgOptions): Promise<T>;
	/**
	 * Similar to [[Args.restResult]] but returns the value on success, throwing otherwise.
	 * @param type The type of the argument.
	 * @example
	 * ```typescript
	 * // !add 2 Hello World!
	 * const a = await args.pick('integer');
	 * const b = await args.rest('string', { minimum: 1 });
	 * await message.channel.send(`The repeated value is... ${b.repeat(a)}!`);
	 * // Sends "The repeated value is... Hello World!Hello World!"
	 * ```
	 */
	public async rest<K extends keyof ArgType>(type: K, options?: ArgOptions): Promise<ArgType[K]>;
	public async rest<K extends keyof ArgType>(type: K, options?: ArgOptions): Promise<ArgType[K]> {
		const result = await this.restResult(type, options);
		if (isOk(result)) return result.value;
		throw result.error;
	}

	/**
	 * Retrieves all the following arguments.
	 * @param type The type of the argument.
	 * @example
	 * ```typescript
	 * // !add 2 Hello World!
	 * const resolver = Args.make((arg) => ok(arg.split('').reverse()));
	 * const result = await args.repeatResult(resolver, { times: 5 });
	 * if (!result.success) throw new UserError('CountArgumentError', 'You must write up to 5 words.');
	 *
	 * await message.channel.send(`You have written ${result.value.length} word(s): ${result.value.join(' ')}`);
	 * // Sends "You have written 2 word(s): olleH !dlroW"
	 * ```
	 */
	public async repeatResult<T>(type: IArgument<T>, options?: RepeatArgOptions): Promise<Result<T[], UserError>>;
	/**
	 * Retrieves all the following arguments.
	 * @param type The type of the argument.
	 * @example
	 * ```typescript
	 * // !reverse-each 2 Hello World!
	 * const result = await args.repeatResult('string', { times: 5 });
	 * if (!result.success) throw new UserError('CountArgumentError', 'You must write up to 5 words.');
	 *
	 * await message.channel.send(`You have written ${result.value.length} word(s): ${result.value.join(' ')}`);
	 * // Sends "You have written 2 word(s): Hello World!"
	 * ```
	 */
	public async repeatResult<K extends keyof ArgType>(type: K, options?: RepeatArgOptions): Promise<Result<ArgType[K][], UserError>>;
	public async repeatResult<K extends keyof ArgType>(type: K, options: RepeatArgOptions = {}): Promise<Result<ArgType[K][], UserError>> {
		const argument = this.resolveArgument(type);
		if (!argument) return err(new UserError('UnavailableArgument', `The argument "${type as string}" was not found.`));

		if (this.parser.finished) return err(new UserError('MissingArguments', 'There are no more arguments.'));

		const output: ArgType[K][] = [];
		for (let i = 0, times = options.times ?? Infinity; i < times; i++) {
			const result = await this.parser.singleParseAsync(async (arg) =>
				argument.run(arg, {
					message: this.message,
					command: this.command,
					...options
				})
			);
			if (result === null) break;
			if (isErr(result)) {
				if (output.length === 0) return result;
				break;
			}

			output.push(result.value as ArgType[K]);
		}

		return ok(output);
	}

	/**
	 * Similar to [[Args.repeatResult]] but returns the value on success, throwing otherwise.
	 * @param type The type of the argument.
	 * @example
	 * ```typescript
	 * // !reverse-each 2 Hello World!
	 * const resolver = Args.make((arg) => ok(arg.split('').reverse()));
	 * const result = await args.repeatResult(resolver, { times: 5 });
	 * await message.channel.send(`You have written ${result.length} word(s): ${result.join(' ')}`);
	 * // Sends "You have written 2 word(s): Hello World!"
	 * ```
	 */
	public async repeat<T>(type: IArgument<T>, options?: RepeatArgOptions): Promise<T[]>;
	/**
	 * Similar to [[Args.repeatResult]] but returns the value on success, throwing otherwise.
	 * @param type The type of the argument.
	 * @example
	 * ```typescript
	 * // !add 2 Hello World!
	 * const words = await args.repeat('string', { times: 5 });
	 * await message.channel.send(`You have written ${words.length} word(s): ${words.join(' ')}`);
	 * // Sends "You have written 2 word(s): Hello World!"
	 * ```
	 */
	public async repeat<K extends keyof ArgType>(type: K, options?: RepeatArgOptions): Promise<ArgType[K][]>;
	public async repeat<K extends keyof ArgType>(type: K, options?: RepeatArgOptions): Promise<ArgType[K][]> {
		const result = await this.repeatResult(type, options);
		if (isOk(result)) return result.value;
		throw result.error;
	}

	/**
	 * Checks if one or more flag were given.
	 * @param keys The name(s) of the flag.
	 * @example
	 * ```ts
	 * // Suppose args are from '--f --g'.
	 * console.log(args.getFlags('f'));
	 * >>> true
	 *
	 * console.log(args.getFlags('g', 'h'));
	 * >>> true
	 *
	 * console.log(args.getFlags('h'));
	 * >>> false
	 * ```
	 */
	public getFlags(...keys: readonly string[]) {
		return this.parser.flag(...keys);
	}

	/**
	 * Gets the last value of one or more options.
	 * @param keys The name(s) of the option.
	 * @example
	 * ```ts
	 * // Suppose args are from '--a=1 --b=2 --c=3'.
	 * console.log(args.getOption('a'));
	 * >>> '1'
	 *
	 * console.log(args.getOption('b', 'c'));
	 * >>> '2'
	 *
	 * console.log(args.getOption('d'));
	 * >>> null
	 * ```
	 */
	public getOption(...keys: readonly string[]) {
		return this.parser.option(...keys);
	}

	/**
	 * Gets all the values of one or more option.
	 * @param keys The name(s) of the option.
	 * @example
	 * ```ts
	 * // Suppose args are from '--a=1 --a=1 --b=2 --c=3'.
	 * console.log(args.getOptions('a'));
	 * >>> ['1', '1']
	 *
	 * console.log(args.getOptions('b', 'c'));
	 * >>> ['2', '3']
	 *
	 * console.log(args.getOptions('d'));
	 * >>> null
	 * ```
	 */
	public getOptions(...keys: readonly string[]) {
		return this.parser.options(...keys);
	}

	/**
	 * Saves the current state into the stack following a FILO strategy (first-in, last-out).
	 * @seealso [[Args.restore]]
	 */
	public save() {
		this.states.push(this.parser.save());
	}

	/**
	 * Restores the previously saved state from the stack.
	 * @seealso [[Args.save]]
	 */
	public restore() {
		if (this.states.length !== 0) this.parser.restore(this.states.pop()!);
	}

	/**
	 * Resolves an argument.
	 * @param arg The argument name or [[IArgument]] instance.
	 */
	private resolveArgument<T>(arg: keyof ArgType | IArgument<T>): IArgument<T> | undefined {
		if (typeof arg === 'object') return arg;
		return this.message.client.arguments.get(arg as string) as IArgument<T> | undefined;
	}

	/**
	 * Converts a callback into an usable argument.
	 * @param cb The callback to convert into an [[IArgument]].
	 */
	public static make<T>(cb: IArgument<T>['run'], name = ''): IArgument<T> {
		return { run: cb, name };
	}

	/**
	 * Constructs an [[ArgumentError]] with [[ArgumentError#type]] set to the [[IArgument<T>#name]].
	 * @param argument The argument that caused the rejection.
	 * @param parameter The parameter that triggered the argument.
	 * @param message The description message for the rejection.
	 */
	public static error<T>(argument: IArgument<T>, parameter: string, message: string): ArgumentError<T>;
	/**
	 * Constructs an [[ArgumentError]] with a custom type.
	 * @param argument The argument that caused the rejection.
	 * @param parameter The parameter that triggered the argument.
	 * @param type The identifier for the error.
	 * @param message The description message for the rejection.
	 */
	// eslint-disable-next-line @typescript-eslint/unified-signatures
	public static error<T>(argument: IArgument<T>, parameter: string, type: string, message: string): ArgumentError<T>;
	public static error<T>(argument: IArgument<T>, parameter: string, typeOrMessage: string, rawMessage?: string): ArgumentError<T> {
		const [type, message] = typeof rawMessage === 'undefined' ? [argument.name, typeOrMessage] : [typeOrMessage, rawMessage];
		return new ArgumentError<T>(argument, parameter, type, message);
	}
}

export interface ArgType {
	boolean: boolean;
	channel: Channel;
	date: Date;
	dmChannel: DMChannel;
	float: number;
	guildChannel: GuildChannel;
	hyperlink: URL;
	integer: number;
	member: GuildMember;
	message: Message;
	newsChannel: NewsChannel;
	number: number;
	role: Role;
	string: string;
	textChannel: TextChannel;
	user: User;
	voiceChannel: VoiceChannel;
}

export interface ArgOptions extends Omit<ArgumentContext, 'message' | 'command'> {}

export interface RepeatArgOptions extends ArgOptions {
	/**
	 * The maximum amount of times the argument can be repeated.
	 * @default Infinity
	 */
	times?: number;
}
