import { AliasPiece, AliasPieceOptions, Awaited, PieceContext } from '@sapphire/pieces';
import type { Message } from 'discord.js';
import * as Lexure from 'lexure';
import { Args } from '../parsers/Args';
import type { IPreconditionContainer } from '../utils/preconditions/IPreconditionContainer';
import { PreconditionArrayResolvable, PreconditionContainerArray } from '../utils/preconditions/PreconditionContainerArray';
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
	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	#lexer = new Lexure.Lexer();

	/**
	 * @since 1.0.0
	 * @param context The context.
	 * @param options Optional Command settings.
	 */
	protected constructor(context: PieceContext, { name, ...options }: CommandOptions = {}) {
		super(context, { ...options, name: (name ?? context.name).toLowerCase() });
		this.description = options.description ?? '';
		this.detailedDescription = options.detailedDescription ?? '';
		this.preconditions = new PreconditionContainerArray(options.preconditions);
		this.strategy = new FlagUnorderedStrategy(options.strategyOptions);
		this.#lexer.setQuotes(
			options.quotes ?? [
				['"', '"'], // Double quotes
				['“', '”'], // Fancy quotes (on iOS)
				['「', '」'] // Corner brackets (CJK)
			]
		);
	}

	/**
	 * The pre-parse method. This method can be overriden by plugins to define their own argument parser.
	 * @param message The message that triggered the command.
	 * @param parameters The raw parameters as a single string.
	 */
	public preParse(message: Message, parameters: string): Awaited<T> {
		const parser = new Lexure.Parser(this.#lexer.setInput(parameters).lex()).setUnorderedStrategy(this.strategy);
		const args = new Lexure.Args(parser.parse());
		return new Args(message, this as any, args) as any;
	}

	/**
	 * Executes the command's logic.
	 * @param message The message that triggered the command.
	 * @param args The value returned by [[Command.preParse]], by default an instance of [[Args]].
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
}

/**
 * The [[Command]] options.
 * @since 1.0.0
 */
export interface CommandOptions extends AliasPieceOptions {
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
	 * The [[Precondition]]s to be run, accepts an array of their names.
	 * @seealso [[PreconditionContainerArray]]
	 * @since 1.0.0
	 * @default []
	 */
	preconditions?: PreconditionArrayResolvable;

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
}

export interface CommandContext extends Record<PropertyKey, unknown> {
	/**
	 * The prefix used to run this command
	 */
	prefix: string;
	/**
	 * The alias used to run this command
	 */
	commandName: string;
}
