import { AliasPiece, AliasPieceJSON, AliasStore, PieceContext } from '@sapphire/pieces';
import { Awaitable, isNullish, NonNullObject } from '@sapphire/utilities';
import type { LocalizationMap } from 'discord-api-types/v10';
import {
	AutocompleteInteraction,
	CommandInteraction,
	ContextMenuInteraction,
	Message,
	PermissionResolvable,
	Permissions,
	Snowflake
} from 'discord.js';
import * as Lexure from '@sapphire/lexure';
import { Args } from '../parsers/Args';
import { BucketScope, RegisterBehavior } from '../types/Enums';
import { acquire } from '../utils/application-commands/ApplicationCommandRegistries';
import type { ApplicationCommandRegistry } from '../utils/application-commands/ApplicationCommandRegistry';
import { emitRegistryError } from '../utils/application-commands/emitRegistryError';
import { getNeededRegistryParameters } from '../utils/application-commands/getNeededParameters';
import { PreconditionContainerArray, PreconditionEntryResolvable } from '../utils/preconditions/PreconditionContainerArray';
import { FlagStrategyOptions, FlagUnorderedStrategy } from '../utils/strategies/FlagUnorderedStrategy';

export class Command<PreParseReturn = Args, O extends Command.Options = Command.Options> extends AliasPiece<O> {
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
	public detailedDescription: DetailedDescriptionCommand;

	/**
	 * The full category for the command. Either an array of strings that denote every (sub)folder the command is in,
	 * or `null` if it could not be resolved automatically.
	 *
	 * If this is `null` for how you setup your code then you can overwrite how the `fullCategory` is resolved by
	 * extending this class and overwriting the assignment in the constructor.
	 * @since 2.0.0
	 */
	public readonly fullCategory: readonly string[];

	/**
	 * The strategy to use for the lexer.
	 * @since 1.0.0
	 */
	public strategy: Lexure.IUnorderedStrategy;

	/**
	 * If {@link SapphireClient.typing} is true, it can be overridden for a specific command using this property, set via its options.
	 * Otherwise, this property will be ignored.
	 * @default true
	 */
	public typing: boolean;

	/**
	 * The application command registry associated with this command.
	 * @since 3.0.0
	 */
	public readonly applicationCommandRegistry = acquire(this.name);

	/**
	 * The lexer to be used for command parsing
	 * @since 1.0.0
	 * @private
	 */
	protected lexer;

	/**
	 * @since 1.0.0
	 * @param context The context.
	 * @param options Optional Command settings.
	 */
	protected constructor(context: PieceContext, options: O = {} as O) {
		super(context, { ...options, name: (options.name ?? context.name).toLowerCase() });
		this.description = options.description ?? '';
		this.detailedDescription = options.detailedDescription ?? '';
		this.strategy = new FlagUnorderedStrategy(options);
		this.fullCategory = options.fullCategory ?? this.location.directories;
		this.typing = options.typing ?? true;

		this.lexer = new Lexure.Lexer({
			quotes: options.quotes ?? [
				['"', '"'], // Double quotes
				['“', '”'], // Fancy quotes (on iOS)
				['「', '」'], // Corner brackets (CJK)
				['«', '»'] // French quotes (guillemets)
			]
		});

		if (options.generateDashLessAliases) {
			const dashLessAliases: string[] = [];
			if (this.name.includes('-')) dashLessAliases.push(this.name.replace(/-/g, ''));
			for (const alias of this.aliases) if (alias.includes('-')) dashLessAliases.push(alias.replace(/-/g, ''));

			this.aliases = [...this.aliases, ...dashLessAliases];
		}

		if (options.generateUnderscoreLessAliases) {
			const underscoreLessAliases: string[] = [];
			if (this.name.includes('_')) underscoreLessAliases.push(this.name.replace(/_/g, ''));
			for (const alias of this.aliases) if (alias.includes('_')) underscoreLessAliases.push(alias.replace(/_/g, ''));

			this.aliases = [...this.aliases, ...underscoreLessAliases];
		}

		this.preconditions = new PreconditionContainerArray(options.preconditions);
		this.parseConstructorPreConditions(options);
	}

	/**
	 * The message pre-parse method. This method can be overridden by plugins to define their own argument parser.
	 * @param message The message that triggered the command.
	 * @param parameters The raw parameters as a single string.
	 * @param context The command-context used in this execution.
	 */
	public messagePreParse(message: Message, parameters: string, context: MessageCommand.RunContext): Awaitable<PreParseReturn> {
		const parser = new Lexure.Parser(this.strategy);
		const args = new Lexure.ArgumentStream(parser.run(this.lexer.run(parameters)));
		return new Args(message, this as any, args, context) as any;
	}

	/**
	 * The main category for the command, if any.
	 *
	 * This getter retrieves the first value of {@link Command.fullCategory}, if it has at least one item, otherwise it
	 * returns `null`.
	 *
	 * @note You can set {@link Command.Options.fullCategory} to override the built-in category resolution.
	 */
	public get category(): string | null {
		return this.fullCategory.length > 0 ? this.fullCategory[0] : null;
	}

	/**
	 * The sub-category for the command, if any.
	 *
	 * This getter retrieves the second value of {@link Command.fullCategory}, if it has at least two items, otherwise
	 * it returns `null`.
	 *
	 * @note You can set {@link Command.Options.fullCategory} to override the built-in category resolution.
	 */
	public get subCategory(): string | null {
		return this.fullCategory.length > 1 ? this.fullCategory[1] : null;
	}

	/**
	 * The parent category for the command.
	 *
	 * This getter retrieves the last value of {@link Command.fullCategory}, if it has at least one item, otherwise it
	 * returns `null`.
	 *
	 * @note You can set {@link Command.Options.fullCategory} to override the built-in category resolution.
	 */
	public get parentCategory(): string | null {
		return this.fullCategory.length > 1 ? this.fullCategory[this.fullCategory.length - 1] : null;
	}

	/**
	 * Executes the message command's logic.
	 * @param message The message that triggered the command.
	 * @param args The value returned by {@link Command.messagePreParse}, by default an instance of {@link Args}.
	 * @param context The context in which the command was executed.
	 */
	public messageRun?(message: Message, args: PreParseReturn, context: MessageCommand.RunContext): Awaitable<unknown>;

	/**
	 * Executes the application command's logic.
	 * @param interaction The interaction that triggered the command.
	 */
	public chatInputRun?(interaction: CommandInteraction, context: ChatInputCommand.RunContext): Awaitable<unknown>;

	/**
	 * Executes the context menu's logic.
	 * @param interaction The interaction that triggered the command.
	 */
	public contextMenuRun?(interaction: ContextMenuInteraction, context: ContextMenuCommand.RunContext): Awaitable<unknown>;

	/**
	 * Executes the autocomplete logic.
	 *
	 * :::tip
	 *
	 * You may use this, or alternatively create an {@link InteractionHandler interaction handler} to handle autocomplete interactions.
	 * Keep in mind that commands take precedence over interaction handlers.
	 *
	 * :::
	 *
	 * @param interaction The interaction that triggered the autocomplete.
	 */
	public autocompleteRun?(interaction: AutocompleteInteraction): Awaitable<unknown>;

	/**
	 * Defines the JSON.stringify behavior of the command.
	 */
	public toJSON(): CommandJSON {
		return {
			...super.toJSON(),
			description: this.description,
			detailedDescription: this.detailedDescription,
			category: this.category
		};
	}

	/**
	 * Registers the application commands that should be handled by this command.
	 * @param registry This command's registry
	 */
	public registerApplicationCommands?(registry: ApplicationCommandRegistry): Awaitable<void>;

	/**
	 * Type-guard that ensures the command supports message commands by checking if the handler for it is present
	 */
	public supportsMessageCommands(): this is MessageCommand {
		return Reflect.has(this, 'messageRun');
	}

	/**
	 * Type-guard that ensures the command supports chat input commands by checking if the handler for it is present
	 */
	public supportsChatInputCommands(): this is ChatInputCommand {
		return Reflect.has(this, 'chatInputRun');
	}

	/**
	 * Type-guard that ensures the command supports context menu commands by checking if the handler for it is present
	 */
	public supportsContextMenuCommands(): this is ContextMenuCommand {
		return Reflect.has(this, 'contextMenuRun');
	}

	/**
	 * Type-guard that ensures the command supports handling autocomplete interactions by checking if the handler for it is present
	 */
	public supportsAutocompleteInteractions(): this is AutocompleteCommand {
		return Reflect.has(this, 'autocompleteRun');
	}

	public override async reload() {
		// Remove the aliases from the command store
		const store = this.store as AliasStore<this>;
		const registry = this.applicationCommandRegistry;

		for (const nameOrId of registry.chatInputCommands) {
			const aliasedPiece = store.aliases.get(nameOrId);
			if (aliasedPiece === this) {
				store.aliases.delete(nameOrId);
			}
		}

		for (const nameOrId of registry.contextMenuCommands) {
			const aliasedPiece = store.aliases.get(nameOrId);
			if (aliasedPiece === this) {
				store.aliases.delete(nameOrId);
			}
		}

		// Reset the registry's contents
		registry.chatInputCommands.clear();
		registry.contextMenuCommands.clear();
		registry['apiCalls'].length = 0;

		// Reload the command
		await super.reload();

		// Get the command from the store to get any changes from the reload
		const updatedPiece = store.get(this.name);

		// This likely shouldn't happen but not worth continuing if the piece is somehow no longer available
		if (!updatedPiece) return;

		const updatedRegistry = updatedPiece.applicationCommandRegistry;

		if (updatedPiece.registerApplicationCommands) {
			// Rerun the registry
			try {
				await updatedPiece.registerApplicationCommands(updatedRegistry);
			} catch (err) {
				emitRegistryError(err, updatedPiece);
				// No point on continuing
				return;
			}
		}

		// Re-initialize the store and the API data (insert in the store handles the register method)
		const { applicationCommands, globalCommands, guildCommands } = await getNeededRegistryParameters();

		// Handle the API calls
		// eslint-disable-next-line @typescript-eslint/dot-notation
		await updatedRegistry['runAPICalls'](applicationCommands, globalCommands, guildCommands);

		// Re-set the aliases
		for (const nameOrId of updatedRegistry.chatInputCommands) {
			store.aliases.set(nameOrId, updatedPiece);
		}

		for (const nameOrId of updatedRegistry.contextMenuCommands) {
			store.aliases.set(nameOrId, updatedPiece);
		}
	}

	/**
	 * Parses the command's options and processes them, calling {@link Command#parseConstructorPreConditionsRunIn},
	 * {@link Command#parseConstructorPreConditionsNsfw},
	 * {@link Command#parseConstructorPreConditionsRequiredClientPermissions}, and
	 * {@link Command#parseConstructorPreConditionsCooldown}.
	 * @since 2.0.0
	 * @param options The command options given from the constructor.
	 */
	protected parseConstructorPreConditions(options: Command.Options): void {
		this.parseConstructorPreConditionsRunIn(options);
		this.parseConstructorPreConditionsNsfw(options);
		this.parseConstructorPreConditionsRequiredClientPermissions(options);
		this.parseConstructorPreConditionsRequiredUserPermissions(options);
		this.parseConstructorPreConditionsCooldown(options);
	}

	/**
	 * Appends the `NSFW` precondition if {@link Command.Options.nsfw} is set to true.
	 * @param options The command options given from the constructor.
	 */
	protected parseConstructorPreConditionsNsfw(options: Command.Options) {
		if (options.nsfw) this.preconditions.append(CommandPreConditions.NotSafeForWork);
	}

	/**
	 * Appends the `DMOnly`, `GuildOnly`, `NewsOnly`, and `TextOnly` preconditions based on the values passed in
	 * {@link Command.Options.runIn}, optimizing in specific cases (`NewsOnly` + `TextOnly` = `GuildOnly`; `DMOnly` +
	 * `GuildOnly` = `null`), defaulting to `null`, which doesn't add a precondition.
	 * @param options The command options given from the constructor.
	 */
	protected parseConstructorPreConditionsRunIn(options: Command.Options) {
		const runIn = this.resolveConstructorPreConditionsRunType(options.runIn);
		if (runIn !== null) this.preconditions.append(runIn as any);
	}

	/**
	 * Appends the `ClientPermissions` precondition when {@link Command.Options.requiredClientPermissions} resolves to a
	 * non-zero bitfield.
	 * @param options The command options given from the constructor.
	 */
	protected parseConstructorPreConditionsRequiredClientPermissions(options: Command.Options) {
		const permissions = new Permissions(options.requiredClientPermissions);
		if (permissions.bitfield !== 0n) {
			this.preconditions.append({ name: CommandPreConditions.ClientPermissions, context: { permissions } });
		}
	}

	/**
	 * Appends the `UserPermissions` precondition when {@link Command.Options.requiredUserPermissions} resolves to a
	 * non-zero bitfield.
	 * @param options The command options given from the constructor.
	 */
	protected parseConstructorPreConditionsRequiredUserPermissions(options: Command.Options) {
		const permissions = new Permissions(options.requiredUserPermissions);
		if (permissions.bitfield !== 0n) {
			this.preconditions.append({ name: CommandPreConditions.UserPermissions, context: { permissions } });
		}
	}

	/**
	 * Appends the `Cooldown` precondition when {@link Command.Options.cooldownLimit} and
	 * {@link Command.Options.cooldownDelay} are both non-zero.
	 * @param options The command options given from the constructor.
	 */
	protected parseConstructorPreConditionsCooldown(options: Command.Options) {
		const { defaultCooldown } = this.container.client.options;

		// We will check for whether the command is filtered from the defaults, but we will allow overridden values to
		// be set. If an overridden value is passed, it will have priority. Otherwise it will default to 0 if filtered
		// (causing the precondition to not be registered) or the default value with a fallback to a single-use cooldown.
		const filtered = defaultCooldown?.filteredCommands?.includes(this.name) ?? false;
		const limit = options.cooldownLimit ?? (filtered ? 0 : defaultCooldown?.limit ?? 1);
		const delay = options.cooldownDelay ?? (filtered ? 0 : defaultCooldown?.delay ?? 0);

		if (limit && delay) {
			const scope = options.cooldownScope ?? defaultCooldown?.scope ?? BucketScope.User;
			const filteredUsers = options.cooldownFilteredUsers ?? defaultCooldown?.filteredUsers;
			this.preconditions.append({
				name: CommandPreConditions.Cooldown,
				context: { scope, limit, delay, filteredUsers }
			});
		}
	}

	private resolveConstructorPreConditionsRunType(runIn: Command.Options['runIn']): PreconditionContainerArray | CommandPreConditions | null {
		if (isNullish(runIn)) return null;
		if (typeof runIn === 'string') {
			switch (runIn) {
				case 'DM':
					return CommandPreConditions.DirectMessageOnly;
				case 'GUILD_TEXT':
					return CommandPreConditions.GuildTextOnly;
				case 'GUILD_VOICE':
					return CommandPreConditions.GuildVoiceOnly;
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
		const guildVoice = keys.has('GUILD_VOICE');
		const guildNews = keys.has('GUILD_NEWS');
		const guild = guildText && guildNews && guildVoice;

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

			if (guildVoice) {
				preconditions.append(CommandPreConditions.GuildVoiceOnly);
			}
		}

		return preconditions;
	}
}

export type MessageCommand = Command & Required<Pick<Command, 'messageRun'>>;

export namespace MessageCommand {
	export type Options = CommandOptions;
	export type JSON = CommandJSON;
	export type Context = AliasPiece.Context;
	export type RunInTypes = CommandOptionsRunType;
	export type RunContext = MessageCommandContext;
}

export type ChatInputCommand = Command & Required<Pick<Command, 'chatInputRun'>>;

export namespace ChatInputCommand {
	export type Options = CommandOptions;
	export type JSON = CommandJSON;
	export type Context = AliasPiece.Context;
	export type RunInTypes = CommandOptionsRunType;
	export type RunContext = ChatInputCommandContext;
	export type Interaction<Cached extends import('discord.js').CacheType = import('discord.js').CacheType> = CommandInteraction<Cached>;
	export type Registry = ApplicationCommandRegistry;
}

export type ContextMenuCommand = Command & Required<Pick<Command, 'contextMenuRun'>>;

export namespace ContextMenuCommand {
	export type Options = CommandOptions;
	export type JSON = CommandJSON;
	export type Context = AliasPiece.Context;
	export type RunInTypes = CommandOptionsRunType;
	export type RunContext = ContextMenuCommandContext;
	export type Interaction<Cached extends import('discord.js').CacheType = import('discord.js').CacheType> = ContextMenuInteraction<Cached>;
	export type Registry = ApplicationCommandRegistry;
}

export type AutocompleteCommand = Command & Required<Pick<Command, 'autocompleteRun'>>;

export namespace AutocompleteCommand {
	export type Options = CommandOptions;
	export type JSON = CommandJSON;
	export type Context = AliasPiece.Context;
	export type RunInTypes = CommandOptionsRunType;
	export type RunContext = AutocompleteCommandContext;
	export type Interaction<Cached extends import('discord.js').CacheType = import('discord.js').CacheType> = AutocompleteInteraction<Cached>;
	export type Registry = ApplicationCommandRegistry;
}

/**
 * The allowed values for {@link Command.Options.runIn}.
 * @remark It is discouraged to use this type, we recommend using {@link Command.OptionsRunTypeEnum} instead.
 * @since 2.0.0
 */
export type CommandOptionsRunType =
	| 'DM'
	| 'GUILD_TEXT'
	| 'GUILD_VOICE'
	| 'GUILD_NEWS'
	| 'GUILD_NEWS_THREAD'
	| 'GUILD_PUBLIC_THREAD'
	| 'GUILD_PRIVATE_THREAD'
	| 'GUILD_ANY';

/**
 * The allowed values for {@link Command.Options.runIn} as an enum.
 * @since 2.0.0
 */
export const enum CommandOptionsRunTypeEnum {
	Dm = 'DM',
	GuildText = 'GUILD_TEXT',
	GuildVoice = 'GUILD_VOICE',
	GuildNews = 'GUILD_NEWS',
	GuildNewsThread = 'GUILD_NEWS_THREAD',
	GuildPublicThread = 'GUILD_PUBLIC_THREAD',
	GuildPrivateThread = 'GUILD_PRIVATE_THREAD',
	GuildAny = 'GUILD_ANY'
}

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
	GuildVoiceOnly = 'GuildVoiceOnly',
	GuildThreadOnly = 'GuildThreadOnly',
	NotSafeForWork = 'NSFW',
	ClientPermissions = 'ClientPermissions',
	UserPermissions = 'UserPermissions'
}

/**
 * The {@link Command} options.
 * @since 1.0.0
 */
export interface CommandOptions extends AliasPiece.Options, FlagStrategyOptions {
	/**
	 * Whether to add aliases for commands with dashes in them
	 * @since 1.0.0
	 * @default false
	 */
	generateDashLessAliases?: boolean;

	/**
	 * Whether to add aliases for commands with underscores in them
	 * @since 3.0.0
	 * @default false
	 */
	generateUnderscoreLessAliases?: boolean;

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
	detailedDescription?: DetailedDescriptionCommand;

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
	 *   ['«', '»'] // French quotes (guillemets)
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
	 * The amount of entries the cooldown can have before filling up, if set to a non-zero value alongside {@link Command.Options.cooldownDelay}, the `Cooldown` precondition will be added to the list.
	 * @since 2.0.0
	 * @default 1
	 */
	cooldownLimit?: number;

	/**
	 * The time in milliseconds for the cooldown entries to reset, if set to a non-zero value alongside {@link Command.Options.cooldownLimit}, the `Cooldown` precondition will be added to the list.
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
	 * The required permissions for the user.
	 * @since 2.0.0
	 * @default 0
	 */
	requiredUserPermissions?: PermissionResolvable;

	/**
	 * The channels the command should run in. If set to `null`, no precondition entry will be added. Some optimizations are applied when given an array to reduce the amount of preconditions run (e.g. `'GUILD_TEXT'` and `'GUILD_NEWS'` becomes `'GUILD_ANY'`, and if both `'DM'` and `'GUILD_ANY'` are defined, then no precondition entry is added as it runs in all channels).
	 * @since 2.0.0
	 * @default null
	 */
	runIn?: Command.RunInTypes | CommandOptionsRunTypeEnum | readonly (Command.RunInTypes | CommandOptionsRunTypeEnum)[] | null;

	/**
	 * If {@link SapphireClient.typing} is true, this option will override it.
	 * Otherwise, this option has no effect - you may call {@link Channel#sendTyping}` in the run method if you want specific commands to display the typing status.
	 * @default true
	 */
	typing?: boolean;
}

export interface CommandChatInputRegisterShortcut {
	/**
	 * Specifies what we should do when the command is present, but not identical with the data you provided
	 * @default RegisterBehavior.LogToConsole
	 */
	behaviorWhenNotIdentical?: RegisterBehavior;
	/**
	 * If we should register the command, be it missing or present already
	 * @default false
	 */
	register: boolean;
	/**
	 * If this is specified, the application commands will only be registered for these guild ids.
	 *
	 * :::tip
	 *
	 * If you want to register both guild and global chat input commands,
	 * please read the [guide about registering application commands](https://www.sapphirejs.dev/docs/Guide/commands/registering-application-commands) instead.
	 *
	 * :::
	 *
	 */
	guildIds?: string[];
	/**
	 * Specifies a list of command ids that we should check in the event of a name mismatch
	 * @default []
	 */
	idHints?: string[];
	/**
	 * Sets the `defaultPermission` field for the chat input command
	 *
	 * :::warn
	 *
	 * This will be deprecated in the future for Discord's new permission system.
	 *
	 * :::
	 */
	defaultPermission?: boolean;
	/**
	 * Sets the `nameLocalizations` for the chat input command
	 */
	nameLocalizations?: LocalizationMap;
	/**
	 * Sets the `descriptionLocalizations` for the chat input command
	 */
	descriptionLocalizations?: LocalizationMap;
}

export interface MessageCommandContext extends Record<PropertyKey, unknown> {
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
	 * The matched prefix, this will always be the same as {@link MessageCommand.RunContext.prefix} if it was a string, otherwise it is
	 * the result of doing `prefix.exec(content)[0]`.
	 */
	commandPrefix: string;
}

export interface ChatInputCommandContext extends Record<PropertyKey, unknown> {
	/**
	 * The name of the command.
	 */
	commandName: string;
	/**
	 * The id of the command.
	 */
	commandId: string;
}

export interface ContextMenuCommandContext extends Record<PropertyKey, unknown> {
	/**
	 * The name of the command.
	 */
	commandName: string;
	/**
	 * The id of the command.
	 */
	commandId: string;
}

export interface AutocompleteCommandContext extends Record<PropertyKey, unknown> {
	/**
	 * The name of the command.
	 */
	commandName: string;
	/**
	 * The id of the command.
	 */
	commandId: string;
}

export interface CommandJSON extends AliasPieceJSON {
	description: string;
	detailedDescription: DetailedDescriptionCommand;
	category: string | null;
}

export namespace Command {
	export type Options = CommandOptions;
	export type JSON = CommandJSON;
	export type Context = AliasPiece.Context;
	export type RunInTypes = CommandOptionsRunType;
	export type ChatInputInteraction<Cached extends import('discord.js').CacheType = import('discord.js').CacheType> =
		import('discord.js').CommandInteraction<Cached>;
	export type ContextMenuInteraction<Cached extends import('discord.js').CacheType = import('discord.js').CacheType> =
		import('discord.js').ContextMenuInteraction<Cached>;
	export type AutocompleteInteraction<Cached extends import('discord.js').CacheType = import('discord.js').CacheType> =
		import('discord.js').AutocompleteInteraction<Cached>;
	export type Registry = ApplicationCommandRegistry;
}

export type DetailedDescriptionCommand = string | DetailedDescriptionCommandObject;

export interface DetailedDescriptionCommandObject extends NonNullObject {}
