import { AliasPiece, AliasPieceOptions, PieceContext } from '@sapphire/pieces';
import { Awaited, isNullish } from '@sapphire/utilities';
import { Message, PermissionResolvable, Permissions, Snowflake } from 'discord.js';
import * as Lexure from 'lexure';
import { sep } from 'path';
import { Args } from '../parsers/Args';
import { BucketScope } from '../types/Enums';
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
	public preconditions: PreconditionContainerArray;

	/**
	 * Longer version of command's summary and how to use it
	 * @since 1.0.0
	 */
	public detailedDescription: string;

	/**
	 * The full category for the command. Either an array of strings that denote every (sub)folder the command is in,
	 * or `null` if it could not be resolved automatically.
	 *
	 * If this is `null` for how you setup your code then you can overwrite how the `fullCategory` is resolved by
	 * extending this class and overwriting the assignment in the constructor.
	 * @since 2.0.0
	 */
	public readonly fullCategory: readonly string[] | null = null;

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
	protected constructor(context: PieceContext, options: CommandOptions = {}) {
		super(context, { ...options, name: (options.name ?? context.name).toLowerCase() });
		this.description = options.description ?? '';
		this.detailedDescription = options.detailedDescription ?? '';
		this.strategy = new FlagUnorderedStrategy(options);

		this.lexer.setQuotes(
			options.quotes ?? [
				['"', '"'], // Double quotes
				['“', '”'], // Fancy quotes (on iOS)
				['「', '」'] // Corner brackets (CJK)
			]
		);

		if (options.fullCategory) {
			this.fullCategory = options.fullCategory;
		} else {
			const commandsFolders = [...this.container.stores.get('commands').paths.values()].map((p) => p.split(sep).pop() ?? '');
			const commandPath = context.path.split(sep);
			for (const commandFolder of commandsFolders) {
				if (commandPath.includes(commandFolder)) {
					this.fullCategory = commandPath.slice(commandPath.indexOf(commandFolder) + 1, -1);
					break;
				}
			}
		}

		if (options.generateDashLessAliases) {
			const dashLessAliases = [];
			if (this.name.includes('-')) dashLessAliases.push(this.name.replace(/-/g, ''));
			for (const alias of this.aliases) if (alias.includes('-')) dashLessAliases.push(alias.replace(/-/g, ''));

			this.aliases = [...this.aliases, ...dashLessAliases];
		}

		this.preconditions = new PreconditionContainerArray(options.preconditions);
		this.parseConstructorPreConditions(options);
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
	 * Get all the main categories of commands.
	 */
	public get categories(): (string | null)[] {
		return Array.from(new Set([...this.container.stores.get('commands').values()].map(({ category }) => category)));
	}

	/**
	 * The main category for the command, if any.
	 * This is resolved from {@link Command.fullCategory}, which is automatically
	 * resolved in the constructor. If you need different logic for category
	 * then please first look into overwriting {@link Command.fullCategory} before
	 * looking to overwrite this getter.
	 */
	public get category(): string | null {
		return (this.fullCategory?.length ?? 0) > 0 ? this.fullCategory?.[0] ?? null : null;
	}

	/**
	 * The sub category for the command
	 * This is resolved from {@link Command.fullCategory}, which is automatically
	 * resolved in the constructor. If you need different logic for category
	 * then please first look into overwriting {@link Command.fullCategory} before
	 * looking to overwrite this getter.
	 */
	public get subCategory(): string | null {
		return (this.fullCategory?.length ?? 0) > 1 ? this.fullCategory?.[1] ?? null : null;
	}

	/**
	 * The parent category for the command
	 * This is resolved from {@link Command.fullCategory}, which is automatically
	 * resolved in the constructor. If you need different logic for category
	 * then please first look into overwriting {@link Command.fullCategory} before
	 * looking to overwrite this getter.
	 */
	public get parentCategory(): string | null {
		return (this.fullCategory?.length ?? 0) > 0 ? this.fullCategory?.[(this.fullCategory?.length ?? 1) - 1] ?? null : null;
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
			category: this.category,
			strategy: this.strategy
		};
	}

	/**
	 * Parses the command's options and processes them, calling {@link Command#parseConstructorPreConditionsRunIn},
	 * {@link Command#parseConstructorPreConditionsNsfw},
	 * {@link Command#parseConstructorPreConditionsRequiredClientPermissions}, and
	 * {@link Command#parseConstructorPreConditionsCooldown}.
	 * @since 2.0.0
	 * @param options The command options given from the constructor.
	 */
	protected parseConstructorPreConditions(options: CommandOptions): void {
		this.parseConstructorPreConditionsRunIn(options);
		this.parseConstructorPreConditionsNsfw(options);
		this.parseConstructorPreConditionsRequiredClientPermissions(options);
		this.parseConstructorPreConditionsCooldown(options);
	}

	/**
	 * Appends the `NSFW` precondition if {@link CommandOptions.nsfw} is set to true.
	 * @param options The command options given from the constructor.
	 */
	protected parseConstructorPreConditionsNsfw(options: CommandOptions) {
		if (options.nsfw) this.preconditions.append(CommandPreConditions.NotSafeForWork);
	}

	/**
	 * Appends the `DMOnly`, `GuildOnly`, `NewsOnly`, and `TextOnly` preconditions based on the values passed in
	 * {@link CommandOptions.runIn}, optimizing in specific cases (`NewsOnly` + `TextOnly` = `GuildOnly`; `DMOnly` +
	 * `GuildOnly` = `null`), defaulting to `null`, which doesn't add a precondition.
	 * @param options The command options given from the constructor.
	 */
	protected parseConstructorPreConditionsRunIn(options: CommandOptions) {
		const runIn = this.resolveConstructorPreConditionsRunType(options.runIn);
		if (runIn !== null) this.preconditions.append(runIn as any);
	}

	/**
	 * Appends the `Permissions` precondition when {@link CommandOptions.requiredClientPermissions} resolves to a
	 * non-zero bitfield.
	 * @param options The command options given from the constructor.
	 */
	protected parseConstructorPreConditionsRequiredClientPermissions(options: CommandOptions) {
		const permissions = new Permissions(options.requiredClientPermissions);
		if (permissions.bitfield !== 0n) {
			this.preconditions.append({ name: CommandPreConditions.Permissions, context: { permissions } });
		}
	}

	/**
	 * Appends the `Cooldown` precondition when {@link CommandOptions.cooldownLimit} and
	 * {@link CommandOptions.cooldownDelay} are both non-zero.
	 * @param options The command options given from the constructor.
	 */
	protected parseConstructorPreConditionsCooldown(options: CommandOptions) {
		const limit = options.cooldownLimit ?? 1;
		const delay = options.cooldownDelay ?? 0;
		const filteredUsers = options.cooldownFilteredUsers;

		if (limit && delay) {
			this.preconditions.append({
				name: CommandPreConditions.Cooldown,
				context: { scope: options.cooldownScope ?? BucketScope.User, limit, delay, filteredUsers }
			});
		}
	}

	private resolveConstructorPreConditionsRunType(runIn: CommandOptions['runIn']): PreconditionContainerArray | CommandPreConditions | null {
		if (isNullish(runIn)) return null;
		if (typeof runIn === 'string') {
			switch (runIn) {
				case 'DM':
					return CommandPreConditions.DirectMessageOnly;
				case 'GUILD_TEXT':
					return CommandPreConditions.GuildTextOnly;
				case 'GUILD_NEWS':
					return CommandPreConditions.GuildNewsOnly;
				case 'GUILD_NEWS_THREAD':
					return CommandPreConditions.GuildNewsThreadOnly;
				case 'GUILD_PUBLIC_THREAD':
					return CommandPreConditions.GuildPublicThreadOnly;
				case 'GUILD_PRIVATE_THREAD':
					return CommandPreConditions.GuildPrivateThreadOnly;
				case 'GUILD_ANY':
					return CommandPreConditions.GuildOnly;
				default:
					return null;
			}
		}

		// If there's no channel it can run on, throw an error:
		if (runIn.length === 0) {
			throw new Error(`${this.constructor.name}[${this.name}]: "runIn" was specified as an empty array.`);
		}

		if (runIn.length === 1) {
			return this.resolveConstructorPreConditionsRunType(runIn[0]);
		}

		const keys = new Set(runIn);

		const dm = keys.has('DM');
		const guildText = keys.has('GUILD_TEXT');
		const guildNews = keys.has('GUILD_NEWS');
		const guild = guildText && guildNews;

		// If runs everywhere, optimise to null:
		if (dm && guild) return null;

		const guildPublicThread = keys.has('GUILD_PUBLIC_THREAD');
		const guildPrivateThread = keys.has('GUILD_PRIVATE_THREAD');
		const guildNewsThread = keys.has('GUILD_NEWS_THREAD');
		const guildThreads = guildPublicThread && guildPrivateThread && guildNewsThread;

		// If runs in any thread, optimise to thread-only:
		if (guildThreads && keys.size === 3) {
			return CommandPreConditions.GuildThreadOnly;
		}

		const preconditions = new PreconditionContainerArray();
		if (dm) preconditions.append(CommandPreConditions.DirectMessageOnly);
		if (guild) {
			preconditions.append(CommandPreConditions.GuildOnly);
		} else {
			// GuildText includes PublicThread and PrivateThread
			if (guildText) {
				preconditions.append(CommandPreConditions.GuildTextOnly);
			} else {
				if (guildPublicThread) preconditions.append(CommandPreConditions.GuildPublicThreadOnly);
				if (guildPrivateThread) preconditions.append(CommandPreConditions.GuildPrivateThreadOnly);
			}

			// GuildNews includes NewsThread
			if (guildNews) {
				preconditions.append(CommandPreConditions.GuildNewsOnly);
			} else if (guildNewsThread) {
				preconditions.append(CommandPreConditions.GuildNewsThreadOnly);
			}
		}

		return preconditions;
	}
}

/**
 * The allowed values for {@link CommandOptions.runIn}.
 * @since 2.0.0
 */
export type CommandOptionsRunType =
	| 'DM'
	| 'GUILD_TEXT'
	| 'GUILD_NEWS'
	| 'GUILD_NEWS_THREAD'
	| 'GUILD_PUBLIC_THREAD'
	| 'GUILD_PRIVATE_THREAD'
	| 'GUILD_ANY';

/**
 * The available command pre-conditions.
 * @since 2.0.0
 */
export const enum CommandPreConditions {
	Cooldown = 'Cooldown',
	DirectMessageOnly = 'DMOnly',
	GuildNewsOnly = 'GuildNewsOnly',
	GuildNewsThreadOnly = 'GuildNewsThreadOnly',
	GuildOnly = 'GuildOnly',
	GuildPrivateThreadOnly = 'GuildPrivateThreadOnly',
	GuildPublicThreadOnly = 'GuildPublicThreadOnly',
	GuildTextOnly = 'GuildTextOnly',
	GuildThreadOnly = 'GuildThreadOnly',
	NotSafeForWork = 'NSFW',
	Permissions = 'Permissions'
}

/**
 * The {@link Command} options.
 * @since 1.0.0
 */
export interface CommandOptions extends AliasPieceOptions, FlagStrategyOptions {
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
	 * The full category path for the command
	 * @since 2.0.0
	 * @default 'An array of folder names that lead back to the folder that is registered for in the commands store'
	 * @example
	 * ```typescript
	 * // Given a file named `ping.js` at the path of `commands/General/ping.js`
	 * ['General']
	 *
	 * // Given a file named `info.js` at the path of `commands/General/About/ping.js`
	 * ['General', 'About']
	 * ```
	 */
	fullCategory?: string[];

	/**
	 * The {@link Precondition}s to be run, accepts an array of their names.
	 * @seealso {@link PreconditionContainerArray}
	 * @since 1.0.0
	 * @default []
	 */
	preconditions?: readonly PreconditionEntryResolvable[];

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
	 * The amount of entries the cooldown can have before filling up, if set to a non-zero value alongside {@link CommandOptions.cooldownDelay}, the `Cooldown` precondition will be added to the list.
	 * @since 2.0.0
	 * @default 1
	 */
	cooldownLimit?: number;

	/**
	 * The time in milliseconds for the cooldown entries to reset, if set to a non-zero value alongside {@link CommandOptions.cooldownLimit}, the `Cooldown` precondition will be added to the list.
	 * @since 2.0.0
	 * @default 0
	 */
	cooldownDelay?: number;

	/**
	 * The scope of the cooldown entries.
	 * @since 2.0.0
	 * @default BucketScope.User
	 */
	cooldownScope?: BucketScope;

	/**
	 * The users that are exempt from the Cooldown precondition.
	 * Use this to filter out someone like a bot owner
	 * @since 2.0.0
	 * @default undefined
	 */
	cooldownFilteredUsers?: Snowflake[];

	/**
	 * The required permissions for the client.
	 * @since 2.0.0
	 * @default 0
	 */
	requiredClientPermissions?: PermissionResolvable;

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
