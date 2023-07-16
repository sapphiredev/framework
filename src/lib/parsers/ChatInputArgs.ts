import type { CacheType, ChatInputCommandInteraction, CommandInteractionOptionResolver } from 'discord.js';
import type { ChatInputCommand } from '../structures/Command';
import type { ArrayResultType, BaseArgType, ResultType } from './MessageArgs';
import type { Argument, IArgument } from '../structures/Argument';
import { container } from '@sapphire/pieces';
import { Result } from '@sapphire/result';
import { isNullish } from '@sapphire/utilities';
import { ArgumentError } from '../errors/ArgumentError';
import { UserError } from '../errors/UserError';
import { Identifiers } from '../errors/Identifiers';

/**
 * The argument parser to be used in {@link Command}.
 */
export class ChatInputArgs {
	/**
	 * The interaction that triggered the command.
	 */
	public readonly interaction: ChatInputCommandInteraction;

	/**
	 * The command that is being run.
	 */
	public readonly command: ChatInputCommand;

	/**
	 * The context of the command being run.
	 */
	public readonly commandContext: ChatInputCommand.RunContext;

	/**
	 * The base options from the interaction.
	 */
	public readonly options: Omit<CommandInteractionOptionResolver<CacheType>, 'getMessage' | 'getFocused'>;

	public constructor(
		interaction: ChatInputCommandInteraction,
		command: ChatInputCommand,
		options: Omit<CommandInteractionOptionResolver<CacheType>, 'getMessage' | 'getFocused'>,
		context: ChatInputCommand.RunContext
	) {
		this.interaction = interaction;
		this.command = command;
		this.options = options;
		this.commandContext = context;
	}

	/**
	 * Retrieves the next parameter and parses it.
	 * @param type The type of the argument.
	 * @param name The user defined name of the interaction option.
	 * @param options The pickResult options.
	 * @example
	 * ```typescript
	 * // /square 5
	 * const resolver = ChatInputArgs.make((name, { argument, interaction }) => {
	 *   const parsed = interaction.options.getNumber(name);
	 *   if (!parsed) {
	 *      return ChatInputArgs.error({
	 *          argument,
	 *          parameter: name,
	 *          identifier: 'ArgumentNumberNaN',
	 *          message: 'You must write a valid number.'
	 *      });
	 *   }
	 *
	 *   return ChatInputArgs.ok(parsed);
	 * });
	 *
	 * const a = await args.pickResult(resolver, 'number');
	 * if (a.isErr()) throw new UserError('ArgumentNumberNaN', 'You must write a valid number.');
	 *
	 * await interaction.reply(`The result is: ${a.unwrap() ** 2}!`);
	 * // Sends "The result is: 25"
	 * ```
	 */
	public async pickResult<T>(type: IArgument<T>, name: string, options?: ChatInputArgOptions): Promise<ResultType<T>>;
	/**
	 * Retrieves the next parameter and parses it.
	 * @param type The type of the argument.
	 * @param name The user defined name of the interaction option.
	 * @param options The pickResult options.
	 * @example
	 * ```typescript
	 * // /add 1 2
	 * const a = await args.pickResult('integer', 'firstinteger');
	 * if (a.isErr()) throw new UserError('AddArgumentError', 'You must write two numbers, but the first one did not match.');
	 *
	 * const b = await args.pickResult('integer', 'secondinteger');
	 * if (b.isErr()) throw new UserError('AddArgumentError', 'You must write two numbers, but the second one did not match.');
	 *
	 * await interaction.reply(`The result is: ${a.unwrap() + b.unwrap()}!`);
	 * // Sends "The result is: 3"
	 * ```
	 */
	public async pickResult<K extends keyof ChatInputArgType>(
		type: K,
		name: string,
		options?: ChatInputArgOptions
	): Promise<ResultType<ChatInputArgType[K]>>;

	public async pickResult<K extends keyof ChatInputArgType>(
		type: K,
		name: string,
		options: ChatInputArgOptions
	): Promise<ResultType<ChatInputArgType[K]>> {
		const argument = this.resolveArgument<ChatInputArgType[K]>(type);
		if (!argument || !argument.chatInputRun) return this.unavailableArgument(type);

		const result = await Result.fromAsync(
			argument.chatInputRun(name, {
				args: this,
				argument,
				interaction: this.interaction,
				command: this.command,
				commandContext: this.commandContext,
				...options
			})
		);

		return result as ResultType<ChatInputArgType[K]>;
	}

	/**
	 * Similar to {@link ChatInputArgs.pickResult} but returns the value on success, throwing otherwise.
	 * @param type The type of the argument.
	 * @param name The user defined name of the interaction option.
	 * @param options The pick options.
	 * @example
	 * ```typescript
	 * // /square 5
	 * const resolver = ChatInputArgs.make((name, { argument, interaction }) => {
	 *   const parsed = interaction.options.getNumber(name);
	 *   if (!parsed) {
	 *      return ChatInputArgs.error({
	 *          argument,
	 *          parameter: name,
	 *          identifier: 'ArgumentNumberNaN',
	 *          message: 'You must write a valid number.'
	 *      });
	 *   }
	 *
	 *   return ChatInputArgs.ok(parsed);
	 * });
	 *
	 * const a = await args.pick(resolver, 'number');
	 *
	 * await interaction.reply(`The result is: ${a ** 2}!`);
	 * // Sends "The result is: 25"
	 * ```
	 */
	public async pick<T>(type: IArgument<T>, name: string, options?: ChatInputArgOptions): Promise<T>;
	/**
	 * Similar to {@link ChatInputArgs.pickResult} but returns the value on success, throwing otherwise.
	 * @param type The type of the argument.
	 * @param name The user defined name of the interaction option.
	 * @param options The pick options.
	 * @example
	 * ```typescript
	 * // /add 1 2
	 * const a = await args.pick('integer', 'firstinteger');
	 * const b = await args.pick('integer', 'secondinteger');
	 * await interaction.reply(`The result is: ${a + b}!`);
	 * // Sends "The result is: 3"
	 * ```
	 */
	public async pick<K extends keyof ChatInputArgType>(type: K, name: string, options?: ChatInputArgOptions): Promise<ChatInputArgType[K]>;
	public async pick<K extends keyof ChatInputArgType>(type: K, name: string, options?: ChatInputArgOptions): Promise<ChatInputArgType[K]> {
		const result = await this.pickResult(type, name, options);
		return result.unwrapRaw();
	}

	/**
	 * Retrieves all the following arguments.
	 * @param type The type of the argument.
	 * @param names An array of the user defined names of the interaction options.
	 * @param options The repeatResult options.
	 * @example
	 * ```typescript
	 * // /reverse-each Hello World!
	 * const resolver = ChatInputArgs.make((name, { interaction }) =>
	 *      ChatInputArgs.ok(interaction.options.getString(name)?.split('').reverse())
	 * );
	 * const result = await args.repeatResult(resolver, ['word1', 'word2', 'word3', 'word4', 'word5']);
	 * if (result.isErr()) throw new UserError('CountArgumentError', 'You must write up to 5 words.');
	 *
	 * await interaction.reply(`You have written ${result.unwrap().length} word(s): ${result.unwrap().join(' ')}`);
	 * // Sends "You have written 2 word(s): olleH !dlroW"
	 * ```
	 */
	public async repeatResult<T>(type: IArgument<T>, names: string[], options?: ChatInputArgOptions): Promise<ArrayResultType<T>>;
	/**
	 * Retrieves all the following arguments.
	 * @param type The type of the argument.
	 * @param names An array of the user defined names of the interaction options.
	 * @param options The repeatResult options.
	 * @example
	 * ```typescript
	 * // /add Hello World!
	 * const result = await args.repeatResult('string', ['word1', 'word2', 'word3', 'word4', 'word5']);
	 * if (result.isErr()) throw new UserError('CountArgumentError', 'You must write up to 5 words.');
	 *
	 * await interaction.reply(`You have written ${result.unwrap().length} word(s): ${result.unwrap().join(' ')}`);
	 * // Sends "You have written 2 word(s): Hello World!"
	 * ```
	 */
	public async repeatResult<K extends keyof ChatInputArgType>(
		type: K,
		names: string[],
		options?: ChatInputArgOptions
	): Promise<ArrayResultType<ChatInputArgType[K]>>;

	public async repeatResult<K extends keyof ChatInputArgType>(
		type: K,
		names: string[],
		options: ChatInputArgOptions = {}
	): Promise<ArrayResultType<ChatInputArgType[K]>> {
		const argument = this.resolveArgument<ChatInputArgType[K]>(type);
		if (!argument || !argument.chatInputRun) return this.unavailableArgument(type);

		const output: ChatInputArgType[K][] = [];

		for (const name of names) {
			const result = await Result.fromAsync(
				argument.chatInputRun(name, {
					args: this,
					argument,
					interaction: this.interaction,
					command: this.command,
					commandContext: this.commandContext,
					...options
				})
			);

			if (result.isErr()) {
				if (output.length === 0) {
					return result as Result.Err<UserError | ArgumentError<ChatInputArgType[K]>>;
				}

				break;
			}

			if (isNullish(result.unwrap())) break;

			output.push(result.unwrap() as ChatInputArgType[K]);
		}

		return Result.ok(output);
	}

	/**
	 * Similar to {@link ChatInputArgs.repeatResult} but returns the value on success, throwing otherwise.
	 * @param type The type of the argument.
	 * @param names An array of the user defined names of the interaction options.
	 * @param options The repeat options.
	 * @example
	 * ```typescript
	 * // /reverse-each Hello World!
	 * const resolver = ChatInputArgs.make((name, { interaction }) =>
	 *      ChatInputArgs.ok(interaction.options.getString(name)?.split('').reverse())
	 * );
	 * const words = await args.repeat(resolver, ['word1', 'word2', 'word3', 'word4', 'word5']);
	 * await interaction.reply(`You have written ${words.length} word(s): ${words.join(' ')}`);
	 * // Sends "You have written 2 word(s): olleH !dlroW""
	 * ```
	 */
	public async repeat<T>(type: IArgument<T>, names: string[], options?: ChatInputArgOptions): Promise<T[]>;
	/**
	 * Similar to {@link ChatInputArgs.repeatResult} but returns the value on success, throwing otherwise.
	 * @param type The type of the argument.
	 * @param names An array of the user defined names of the interaction options.
	 * @param options The repeat options.
	 * @example
	 * ```typescript
	 * // /add Hello World!
	 * const words = await args.repeat('string', ['word1', 'word2', 'word3', 'word4', 'word5']);
	 * await interaction.reply(`You have written ${words.length} word(s): ${words.join(' ')}`);
	 * // Sends "You have written 2 word(s): Hello World!"
	 * ```
	 */
	public async repeat<K extends keyof ChatInputArgType>(type: K, names: string[], options?: ChatInputArgOptions): Promise<ChatInputArgType[K][]>;
	public async repeat<K extends keyof ChatInputArgType>(type: K, names: string[], options?: ChatInputArgOptions): Promise<ChatInputArgType[K][]> {
		const result = await this.repeatResult(type, names, options);
		return result.unwrapRaw();
	}

	/**
	 * Defines the `JSON.stringify` override.
	 */
	public toJSON(): ChatInputArgsJson {
		return { interaction: this.interaction, command: this.command, commandContext: this.commandContext };
	}

	protected unavailableArgument<T>(type: string | IArgument<T>): Result.Err<UserError> {
		const name = typeof type === 'string' ? type : type.name;
		return Result.err(
			new UserError({
				identifier: Identifiers.ArgsUnavailable,
				message: `The argument "${name}" was not found or does not include the "chatInputRun" method.`,
				context: { name, ...this.toJSON() }
			})
		);
	}

	protected missingArgument(): Result.Err<UserError> {
		return Result.err(new UserError({ identifier: Identifiers.ArgsMissing, message: 'The argument is missing.', context: this.toJSON() }));
	}

	/**
	 * Resolves an argument.
	 * @param arg The argument name or {@link IArgument} instance.
	 */
	private resolveArgument<T>(arg: keyof ChatInputArgType | IArgument<T>): IArgument<T> | undefined {
		if (typeof arg === 'object') return arg;
		return container.stores.get('arguments').get(arg as string) as IArgument<T> | undefined;
	}

	/**
	 * Converts a callback into a usable argument.
	 * @param cb The callback to convert into an {@link IArgument}.
	 * @param name The name of the argument.
	 */
	public static make<T>(cb: IArgument<T>['chatInputRun'], name = ''): IArgument<T> {
		return { chatInputRun: cb, name };
	}

	/**
	 * Constructs an {@link Ok} result.
	 * @param value The value to pass.
	 */
	public static ok<T>(value: T): Result.Ok<T> {
		return Result.ok(value);
	}

	/**
	 * Constructs an {@link Err} result containing an {@link ArgumentError}.
	 * @param options The options for the argument error.
	 */
	public static error<T>(options: ArgumentError.Options<T>): Result.Err<ArgumentError<T>> {
		return Result.err(new ArgumentError<T>(options));
	}
}

export interface ChatInputArgsJson {
	interaction: ChatInputCommandInteraction;
	command: ChatInputCommand;
	commandContext: ChatInputCommand.RunContext;
}

export interface ChatInputArgType extends BaseArgType {}

export interface ChatInputArgOptions extends Omit<Argument.ChatInputContext, 'interaction' | 'command'> {}
