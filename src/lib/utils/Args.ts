import type { Message } from 'discord.js';
import type * as Lexure from 'lexure';
import { UserError } from '../errors/UserError';
import type { ArgumentContext } from '../structures/Argument';
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
	 * The command that is being running.
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
	public async pickResult<K extends keyof ArgType>(type: K, options: ArgOptions = {}): Promise<Result<ArgType[K], UserError>> {
		const argument = this.message.client.arguments.get(type);
		if (!argument) return err(new UserError('UnavailableArgument', `The argument "${type}" was not found.`));

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
	 * // !add 1 2
	 * const a = await args.pick('integer');
	 * const b = await args.pick('integer');
	 * await message.channel.send(`The result is: ${a + b}!`);
	 * // Sends "The result is: 3"
	 * ```
	 */
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
	public async restResult<K extends keyof ArgType>(type: K, options: ArgOptions = {}): Promise<Result<ArgType[K], UserError>> {
		const argument = this.message.client.arguments.get(type);
		if (!argument) return err(new UserError('UnavailableArgument', `The argument "${type}" was not found.`));

		if (this.parser.finished) return err(new UserError('MissingArguments', 'There are no more arguments.'));

		const state = this.parser.save();
		const data = this.parser.many().reduce((acc, token) => `${acc}${token.value}${token.trailing}`, '');
		const result = await argument.run(data, {
			message: this.message,
			command: this.command,
			...options
		});
		if (isOk(result)) return result as Ok<ArgType[K]>;

		this.parser.restore(state);
		return result;
	}

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
	 * const result = await args.repeatResult('string', { times: 5 });
	 * if (!result.success) throw new UserError('CountArgumentError', 'You must write up to 5 words.');
	 *
	 * await message.channel.send(`You have written ${result.value.length} word(s): ${result.value.join(' ')}`);
	 * // Sends "You have written 2 word(s): Hello World!"
	 * ```
	 */
	public async repeatResult<K extends keyof ArgType>(type: K, options: RepeatArgOptions = {}): Promise<Result<ArgType[K][], UserError>> {
		const argument = this.message.client.arguments.get(type);
		if (!argument) return err(new UserError('UnavailableArgument', `The argument "${type}" was not found.`));

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
	 * // !add 2 Hello World!
	 * const words = await args.repeat('string', { times: 5 });
	 * await message.channel.send(`You have written ${words.length} word(s): ${words.join(' ')}`);
	 * // Sends "You have written 2 word(s): Hello World!"
	 * ```
	 */
	public async repeat<K extends keyof ArgType>(type: K, options?: RepeatArgOptions): Promise<ArgType[K][]> {
		const result = await this.repeatResult(type, options);
		if (isOk(result)) return result.value;
		throw result.error;
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
}

export interface ArgType {
	string: string;
	integer: number;
}

export interface ArgOptions extends Omit<ArgumentContext, 'message' | 'command'> {}

export interface RepeatArgOptions extends ArgOptions {
	/**
	 * The maximum amount of times the argument can be repeated.
	 * @default Infinity
	 */
	times?: number;
}
