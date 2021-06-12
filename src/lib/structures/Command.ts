import { AliasPiece, AliasPieceOptions, PieceContext } from '@sapphire/pieces';
import { Awaited, isNullish } from '@sapphire/utilities';
import type { Message } from 'discord.js';
import * as Lexure from 'lexure';
import { Args } from '../parsers/Args';
import type { IPreconditionContainer } from '../utils/preconditions/IPreconditionContainer';
import { PreconditionContainerArray, PreconditionEntryResolvable } from '../utils/preconditions/PreconditionContainerArray';
import { FlagStrategyOptions, FlagUnorderedStrategy } from '../utils/strategies/FlagUnorderedStrategy';

export abstract class Command<T = Args> extends AliasPiece {
	/**
	 * A basic summary about the command
	 * @since 1.0.0
	 */
	public description: string;

	/**
	 * The preconditions to be run.
	 * @since 1.0.0
	 */
	public preconditions: IPreconditionContainer;

	/**
	 * Longer version of command's summary and how to use it
	 * @since 1.0.0
	 */
	public detailedDescription: string;

	/**
	 * The strategy to use for the lexer.
	 * @since 1.0.0
	 */
	public strategy: Lexure.UnorderedStrategy;

	/**
	 * The lexer to be used for command parsing
	 * @since 1.0.0
	 * @private
	 */
	protected lexer = new Lexure.Lexer();

	/**
	 * @since 1.0.0
	 * @param context The context.
	 * @param options Optional Command settings.
	 */
	protected constructor(context: PieceContext, { name, ...options }: CommandOptions = {}) {
		super(context, { ...options, name: (name ?? context.name).toLowerCase() });
		this.description = options.description ?? '';
		this.detailedDescription = options.detailedDescription ?? '';
		this.strategy = new FlagUnorderedStrategy(options.strategyOptions);
		this.lexer.setQuotes(
			options.quotes ?? [
				['"', '"'], // Double quotes
				['“', '”'], // Fancy quotes (on iOS)
				['「', '」'] // Corner brackets (CJK)
			]
		);

		if (options.generateDashLessAliases) {
			const dashLessAliases = [];
			if (this.name.includes('-')) dashLessAliases.push(this.name.replace(/-/g, ''));
			for (const alias of this.aliases) if (alias.includes('-')) dashLessAliases.push(alias.replace(/-/g, ''));

			this.aliases = [...this.aliases, ...dashLessAliases];
		}

		this.preconditions = new PreconditionContainerArray(this.resolveConstructorPreConditions(options));
	}

	/**
	 * The pre-parse method. This method can be overridden by plugins to define their own argument parser.
	 * @param message The message that triggered the command.
	 * @param parameters The raw parameters as a single string.
	 * @param context The command-context used in this execution.
	 */
	public preParse(message: Message, parameters: string, context: CommandContext): Awaited<T> {
		const parser = new Lexure.Parser(this.lexer.setInput(parameters).lex()).setUnorderedStrategy(this.strategy);
		const args = new Lexure.Args(parser.parse());
		return new Args(message, this as any, args, context) as any;
	}

	/**
	 * Executes the command's logic.
	 * @param message The message that triggered the command.
	 * @param args The value returned by {@link Command.preParse}, by default an instance of {@link Args}.
	 */
	public abstract run(message: Message, args: T, context: CommandContext): Awaited<unknown>;

	/**
	 * Defines the JSON.stringify behavior of the command.
	 */
	public toJSON(): Record<string, any> {
		return {
			...super.toJSON(),
			description: this.description,
			detailedDescription: this.detailedDescription,
			strategy: this.strategy
		};
	}

	protected resolveConstructorPreConditions(options: CommandOptions): readonly PreconditionEntryResolvable[] {
		const preconditions = options.preconditions?.slice() ?? [];
		if (options.nsfw) preconditions.push(CommandPreConditions.NotSafeForWork);

		const runIn = this.resolveConstructorPreConditionsRunType(options.runIn);
		if (runIn !== null) preconditions.push(runIn);

		const cooldownBucket = options.cooldownBucket ?? 1;
		if (cooldownBucket && options.cooldownDuration) {
			preconditions.push({ name: CommandPreConditions.Cooldown, context: { bucket: cooldownBucket, cooldown: options.cooldownDuration } });
		}

		return preconditions;
	}

	private resolveConstructorPreConditionsRunType(runIn: CommandOptions['runIn']): CommandPreConditions[] | null {
		if (isNullish(runIn)) return null;
		if (typeof runIn === 'string') {
			switch (runIn) {
				case 'dm':
					return [CommandPreConditions.DirectMessageOnly];
				case 'text':
					return [CommandPreConditions.TextOnly];
				case 'news':
					return [CommandPreConditions.NewsOnly];
				case 'guild':
					return [CommandPreConditions.GuildOnly];
				default:
					return null;
			}
		}

		// If there's no channel it can run on, throw an error:
		if (runIn.length === 0) {
			throw new Error(`${this.constructor.name}[${this.name}]: "runIn" was specified as an empty array.`);
		}

		const dm = runIn.includes('dm');
		const text = runIn.includes('text');
		const news = runIn.includes('news');
		const guild = text && news;

		// If runs everywhere, optimise to null:
		if (dm && guild) return null;

		const array: CommandPreConditions[] = [];
		if (dm) array.push(CommandPreConditions.DirectMessageOnly);
		if (guild) array.push(CommandPreConditions.GuildOnly);
		else if (text) array.push(CommandPreConditions.TextOnly);
		else if (news) array.push(CommandPreConditions.NewsOnly);

		return array;
	}
}

/**
 * The allowed values for {@link CommandOptions.runIn}.
 * @since 2.0.0
 */
export type CommandOptionsRunType = 'dm' | 'text' | 'news' | 'guild';

/**
 * The available command pre-conditions.
 * @since 2.0.0
 */
export const enum CommandPreConditions {
	Cooldown = 'Cooldown',
	NotSafeForWork = 'NSFW',
	DirectMessageOnly = 'DMOnly',
	TextOnly = 'TextOnly',
	NewsOnly = 'NewsOnly',
	GuildOnly = 'GuildOnly'
}

/**
 * The {@link Command} options.
 * @since 1.0.0
 */
export interface CommandOptions extends AliasPieceOptions {
	/**
	 * Whether to add aliases for commands with dashes in them
	 * @since 1.0.0
	 * @default false
	 */
	generateDashLessAliases?: boolean;

	/**
	 * The description for the command.
	 * @since 1.0.0
	 * @default ''
	 */
	description?: string;

	/**
	 * The detailed description for the command.
	 * @since 1.0.0
	 * @default ''
	 */
	detailedDescription?: string;

	/**
	 * The {@link Precondition}s to be run, accepts an array of their names.
	 * @seealso {@link PreconditionContainerArray}
	 * @since 1.0.0
	 * @default []
	 */
	preconditions?: readonly PreconditionEntryResolvable[];

	/**
	 * The options for the lexer strategy.
	 * @since 1.0.0
	 * @default {}
	 */
	strategyOptions?: FlagStrategyOptions;

	/**
	 * The quotes accepted by this command, pass `[]` to disable them.
	 * @since 1.0.0
	 * @default
	 * [
	 *   ['"', '"'], // Double quotes
	 *   ['“', '”'], // Fancy quotes (on iOS)
	 *   ['「', '」'] // Corner brackets (CJK)
	 * ]
	 */
	quotes?: [string, string][];

	/**
	 * Sets whether or not the command should be treated as NSFW. If set to true, the `NSFW` precondition will be added to the list.
	 * @since 2.0.0
	 * @default false
	 */
	nsfw?: boolean;

	/**
	 * Sets the bucket of the cool-down, if set to a non-zero value alongside {@link CommandOptions.cooldownDuration}, the `Cooldown` precondition will be added to the list.
	 * @since 2.0.0
	 * @default 1
	 */
	cooldownBucket?: number;

	/**
	 * Sets the duration of the tickets in the cool-down, if set to a non-zero value alongside {@link CommandOptions.cooldownBucket}, the `Cooldown` precondition will be added to the list.
	 * @since 2.0.0
	 * @default 0
	 */
	cooldownDuration?: number;

	/**
	 * The channels the command should run in. If set to `null`, no precondition entry will be added. Some optimizations are applied when given an array to reduce the amount of preconditions run (e.g. `'text'` and `'news'` becomes `'guild'`, and if both `'dm'` and `'guild'` are defined, then no precondition entry is added as it runs in all channels).
	 * @since 2.0.0
	 * @default null
	 */
	runIn?: CommandOptionsRunType | readonly CommandOptionsRunType[] | null;
}

export interface CommandContext extends Record<PropertyKey, unknown> {
	/**
	 * The prefix used to run this command.
	 *
	 * This is a string for the mention and default prefix, and a RegExp for the `regexPrefix`.
	 */
	prefix: string | RegExp;
	/**
	 * The alias used to run this command.
	 */
	commandName: string;
	/**
	 * The matched prefix, this will always be the same as {@link CommandContext.prefix} if it was a string, otherwise it is
	 * the result of doing `prefix.exec(content)[0]`.
	 */
	commandPrefix: string;
}
