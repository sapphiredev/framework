import type { Awaited } from '@sapphire/pieces';
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
	 * const result = await args.repeat(resolver, { times: 5 });
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
	 * Peeks the following parameter(s) without advancing the parser's state; the state is saved
	 * before running the argument callback and restored after it is invoked.
	 * @param cb The callback returning a result of the peeked argument(s).
	 * @example
	 * ```typescript
	 * // !reversedandscreamfirst hello world
	 * const resolver = Args.make((arg) => ok(arg.split('').reverse().join('')));
	 *
	 * const result = await args.peekWithResult(() => args.repeatResult(resolver));
	 * if (isOk(result)) await message.channel.send(
	 *   `Reversed ${result.value.length} word(s): ${result.value.join(' ')}`
	 * ); // Reversed 2 word(s): olleh dlrow
	 *
	 * const firstWord = await args.pickResult('string');
	 * if (isOk(firstWord)) await message.channel.send(firstWord.value.toUpperCase()); // HELLO
	 * ```
	 * @remarks [[Args.peekResult]] is a convenience method for peeking a single parameter.
	 * @seealso [[Args.peekResult]]
	 */
	public async peekWithResult<T>(cb: () => Awaited<Result<T, UserError>>): Promise<Result<T, UserError>>;
	public async peekWithResult<T>(cb: () => Awaited<Result<T[], UserError>>): Promise<Result<T[], UserError>>;
	/**
	 * Peeks the following parameter(s) without advancing the parser's state; the state is saved
	 * before running the argument callback and restored after it is invoked.
	 * @param cb The callback returning a result of the peeked argument(s).
	 * @example
	 * ```typescript
	 * // !sortandsumtwo 7 3 8 4 22 19
	 * const result = await args.peekWithResult(() => args.repeatResult('number'));
	 * if (isOk(result)) await message.channel.send(`Sorted: ${result.value.sort((a, b) => a - b).join(', ')}`); // Sorted: 3, 4, 7, 8, 19, 22
	 *
	 * const firstTwo = await args.repeatResult('number', { times: 2 });
	 * if (isOk(firstTwo)) {
	 *   const [x, y] = firstTwo.value;
	 *   await message.channel.send(`Sum of first two numbers: ${x + y}`); // Sum of first two numbers: 10
	 * }
	 * ```
	 * @remarks [[Args.peekResult]] is a convenience method for peeking a single parameter.
	 * @seealso [[Args.peekResult]]
	 */
	public async peekWithResult<K extends keyof ArgType>(cb: () => Awaited<Result<ArgType[K], UserError>>): Promise<Result<ArgType[K], UserError>>;
	public async peekWithResult<K extends keyof ArgType>(cb: () => Awaited<Result<ArgType[K][], UserError>>): Promise<Result<ArgType[K][], UserError>>;
	public async peekWithResult<K extends keyof ArgType>(
		cb: () => Awaited<Result<ArgType[K] | ArgType[K][], UserError>>
	): Promise<Result<ArgType[K] | ArgType[K][], UserError>> {
		this.save();
		const result = await cb();
		this.restore();
		return result;
	}

	/**
	 * Similar to [[Args.peekWithResult]] but returns the value on success, throwing otherwise.
	 * @param cb The callback returning a result of the peeked argument(s).
	 * @example
	 * ```typescript
	 * // !reversedandscreamfirst foo bar
	 * const resolver = Args.make((arg) => ok(args.split('').reverse().join('')));
	 *
	 * const reversed = await args.peekWith(() => args.repeatResult(resolver));
	 * await message.channel.send(`Reversed ${reversed.length} word(s): ${reversed.join(' ')}`); // Reversed 2 word(s): oof rab
	 *
	 * const firstWord = await args.pick('string');
	 * await message.channe.send(firstWord.toUpperCase()); // FOO
	 * ```
	 */
	public async peekWith<T>(cb: () => Awaited<Result<T, UserError>>): Promise<T>;
	public async peekWith<T>(cb: () => Awaited<Result<T[], UserError>>): Promise<T[]>;
	/**
	 * Similar to [[Args.peekWithResult]] but returns the value on success, throwing otherwise.
	 * @param cb The callback returning a result of the peeked argument(s).
	 * @example
	 * ```typescript
	 * // !sortandsumtwo 2 9 33 27 16
	 * const numbers = await args.peekWith(() => args.repeatResult('number'));
	 * await message.channel.send(`Sorted: ${numbers.sort((a, b) => a - b).join(', ')}`); // Sorted: 2, 9, 16, 27, 33
	 *
	 * const [x, y] = await args.repeat('number', { times: 2 });
	 * await message.channel.send(`Sum of first two numbers: ${x + y}`); // Sum of first two numbers: 11
	 * ```
	 */
	public async peekWith<K extends keyof ArgType>(cb: () => Awaited<Result<ArgType[K], UserError>>): Promise<ArgType[K]>;
	public async peekWith<K extends keyof ArgType>(cb: () => Awaited<Result<ArgType[K][], UserError>>): Promise<ArgType[K][]>;
	public async peekWith<K extends keyof ArgType>(
		cb: () => Awaited<Result<ArgType[K] | ArgType[K][], UserError>>
	): Promise<ArgType[K] | ArgType[K][]> {
		const result = await this.peekWithResult(cb);
		if (isOk(result)) return result.value;
		throw result.error;
	}

	/**
	 * Peeks the following parameter without advancing the parser's state.
	 * @param type The type of the argument.
	 * @example
	 * ```typescript
	 * // !bigint 25
	 * const resolver = Args.make((arg) => {
	 *   try {
	 *     return ok(BigInt(arg));
	 *   } catch {
	 *     return err(new UserError('InvalidBigInt', 'You must specify a valid number for a bigint.'));
	 *   }
	 * });
	 *
	 * const result = await args.peekResult(resolver);
	 * if (isOk(result)) return message.channel.send(`Your bigint is ${result.value}.`); // Your bigint is 25.
	 * throw result.error;
	 * ```
	 * @remarks This is a convenience method for using [[Args.pickResult]] with [[Args.peekWithResult]].
	 */
	public async peekResult<T>(type: IArgument<T>, options?: ArgOptions): Promise<Result<T, UserError>>;
	/**
	 * Peeks the following parameter without advancing the parser's state.
	 * @param type The type of the argument.
	 * @example
	 * ```typescript
	 * // !dateutc 1608867472611
	 * const result = await args.peekResult('date');
	 * if (isOk(result)) return message.channel.send(`Your date (in UTC): ${date.toUTCString()}`); // Your date (in UTC): Fri, 25 Dec 2020 03:37:52 GMT
	 * throw result.error;
	 * ```
	 * @remarks This is a convenience method for using [[Args.pickResult]] with [[Args.peekWithResult]].
	 */
	public async peekResult<K extends keyof ArgType>(type: K, options?: ArgOptions): Promise<Result<ArgType[K], UserError>>;
	public async peekResult<K extends keyof ArgType>(type: K, options: ArgOptions = {}): Promise<Result<ArgType[K], UserError>> {
		return this.peekWithResult(() => this.pickResult(type, options));
	}

	/**
	 * Similar to [[Args.peekResult]] but returns the value on success, throwing otherwise.
	 * @param type The type of the argument.
	 * @example
	 * ```typescript
	 * // !createdat 730159185517477900
	 * const resolver = Args.make((arg) => 
	 * 	 SnowflakeRegex.test(arg) ? ok(BigInt(arg)) : err(new UserError('InvalidSnowflake', 'You must specify a valid snowflake.'))
	 * );
	 *
	 * const snowflake = await args.peek(resolver);
	 * const timestamp = Number((snowflake >> 22n) + DiscordSnowflake.Epoch);
	 * const createdAt = new Date(timestamp);
	 *
	 * await message.channel.send(
	 *   `The snowflake ${snowflake} was registered on ${createdAt.toUTCString()}.`
	 * ); // The snowflake 730159185517477900 was registered on Tue, 07 Jul 2020 20:31:55 GMT.
	 * ```
	 */
	public async peek<T>(type: IArgument<T>, options?: ArgOptions): Promise<T>;
	/**
	 * Similar to [[Args.peekResult]] but returns the value on success, throwing otherwise.
	 * @param type The type of the argument.
	 * @example
	 * ```typescript
	 * // !content https://discord.com/channels/737141877803057244/737142209639350343/791843123898089483
	 * const remoteMessage = await args.peek('message');
	 * await message.channel.send(
	 *   `${remoteMessage.author.tag}: ${remoteMessage.content}`
	 * ); // RealShadowNova#7462: Yeah, Sapphire has been a great experience so far, especially being able to help and contribute.
	 * ```
	 */
	public async peek<K extends keyof ArgType>(type: K, options?: ArgOptions): Promise<ArgType[K]>;
	public async peek<K extends keyof ArgType>(type: K, options?: ArgOptions): Promise<ArgType[K]> {
		const result = await this.peekResult(type, options);
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
