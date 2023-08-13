import { ArgumentStream, Lexer, Parser, type IUnorderedStrategy } from '@sapphire/lexure';
import { AliasPiece, type AliasPieceJSON } from '@sapphire/pieces';
import { isNullish, type Awaitable, type NonNullObject } from '@sapphire/utilities';
import {
	ChannelType,
	ChatInputCommandInteraction,
	ContextMenuCommandInteraction,
	PermissionsBitField,
	type AutocompleteInteraction,
	type Message,
	type PermissionResolvable,
	type Snowflake
} from 'discord.js';
import { Args } from '../parsers/Args';
import { BucketScope, RegisterBehavior } from '../types/Enums';
import { acquire, getDefaultBehaviorWhenNotIdentical, handleBulkOverwrite } from '../utils/application-commands/ApplicationCommandRegistries';
import type { ApplicationCommandRegistry } from '../utils/application-commands/ApplicationCommandRegistry';
import { getNeededRegistryParameters } from '../utils/application-commands/getNeededParameters';
import { emitPerRegistryError } from '../utils/application-commands/registriesErrors';
import { PreconditionContainerArray, type PreconditionEntryResolvable } from '../utils/preconditions/PreconditionContainerArray';
import { FlagUnorderedStrategy, type FlagStrategyOptions } from '../utils/strategies/FlagUnorderedStrategy';
import type { CommandStore } from './CommandStore';

const ChannelTypes = Object.values(ChannelType).filter((type) => typeof type === 'number') as readonly ChannelType[];
const GuildChannelTypes = ChannelTypes.filter((type) => type !== ChannelType.DM && type !== ChannelType.GroupDM) as readonly ChannelType[];

export class Command<PreParseReturn = Args, O extends Command.Options = Command.Options> extends AliasPiece<O> {
	/**
	 * The {@link CommandStore} that contains this {@link Command}.
	 */
	public declare store: CommandStore;

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
	 * If this is `null` with how you set up your code then you can overwrite how the `fullCategory` is resolved by
	 * extending this class and overwriting the assignment in the constructor.
	 * @since 2.0.0
	 */
	public readonly fullCategory: readonly string[];

	/**
	 * The strategy to use for the lexer.
	 * @since 1.0.0
	 */
	public strategy: IUnorderedStrategy;

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
	protected lexer: Lexer;

	/**
	 * @since 1.0.0
	 * @param context The context.
	 * @param options Optional Command settings.
	 */
	public constructor(context: AliasPiece.Context, options: O = {} as O) {
		super(context, { ...options, name: (options.name ?? context.name).toLowerCase() });
		this.description = options.description ?? '';
		this.detailedDescription = options.detailedDescription ?? '';
		this.strategy = new FlagUnorderedStrategy(options);
		this.fullCategory = options.fullCategory ?? this.location.directories;
		this.typing = options.typing ?? true;

		this.lexer = new Lexer({
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
		const parser = new Parser(this.strategy);
		const args = new ArgumentStream(parser.run(this.lexer.run(parameters)));
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
	 * @param context The chat input command run context.
	 */
	public chatInputRun?(interaction: ChatInputCommandInteraction, context: ChatInputCommand.RunContext): Awaitable<unknown>;

	/**
	 * Executes the context menu's logic.
	 * @param interaction The interaction that triggered the command.
	 * @param context The context menu command run context.
	 */
	public contextMenuRun?(interaction: ContextMenuCommandInteraction, context: ContextMenuCommand.RunContext): Awaitable<unknown>;

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
	public override toJSON(): CommandJSON {
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
		const { store } = this;
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
		registry.guildIdsToFetch.clear();
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
				emitPerRegistryError(err, updatedPiece);
				// No point on continuing
				return;
			}
		}

		// If there are no API calls to execute then exit out early
		if (!updatedRegistry['apiCalls'].length) {
			return;
		}

		// If the default behavior is set to bulk overwrite, handle it as such and return.
		if (getDefaultBehaviorWhenNotIdentical() === RegisterBehavior.BulkOverwrite) {
			await handleBulkOverwrite(store, this.container.client.application!.commands);
			return;
		}

		// Re-initialize the store and the API data (insert in the store handles the register method)
		const { applicationCommands, globalCommands, guildCommands } = await getNeededRegistryParameters(updatedRegistry.guildIdsToFetch);

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
	 * Appends the `RunIn` precondition based on the values passed, defaulting to `null`, which doesn't add a
	 * precondition.
	 * @param options The command options given from the constructor.
	 */
	protected parseConstructorPreConditionsRunIn(options: Command.Options) {
		const types = this.resolveConstructorPreConditionsRunType(options.runIn);
		if (types !== null) {
			this.preconditions.append({ name: CommandPreConditions.RunIn, context: { types } });
		}
	}

	/**
	 * Appends the `ClientPermissions` precondition when {@link Command.Options.requiredClientPermissions} resolves to a
	 * non-zero bitfield.
	 * @param options The command options given from the constructor.
	 */
	protected parseConstructorPreConditionsRequiredClientPermissions(options: Command.Options) {
		const permissions = new PermissionsBitField(options.requiredClientPermissions);
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
		const permissions = new PermissionsBitField(options.requiredUserPermissions);
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
		// be set. If an overridden value is passed, it will have priority. Otherwise, it will default to 0 if filtered
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

	private resolveConstructorPreConditionsRunType(types: Command.Options['runIn']): readonly ChannelType[] | null {
		if (isNullish(types)) return null;
		if (typeof types === 'number') return [types];
		if (typeof types === 'string') {
			switch (types) {
				case 'DM':
					return [ChannelType.DM];
				case 'GUILD_TEXT':
					return [ChannelType.GuildText];
				case 'GUILD_VOICE':
					return [ChannelType.GuildVoice];
				case 'GUILD_NEWS':
					return [ChannelType.GuildAnnouncement];
				case 'GUILD_NEWS_THREAD':
					return [ChannelType.AnnouncementThread];
				case 'GUILD_PUBLIC_THREAD':
					return [ChannelType.PublicThread];
				case 'GUILD_PRIVATE_THREAD':
					return [ChannelType.PrivateThread];
				case 'GUILD_ANY':
					return GuildChannelTypes;
				default:
					return null;
			}
		}

		// If there's no channel it can run on, throw an error:
		if (types.length === 0) {
			throw new Error(`${this.constructor.name}[${this.name}]: "runIn" was specified as an empty array.`);
		}

		if (types.length === 1) {
			return this.resolveConstructorPreConditionsRunType(types[0]);
		}

		const resolved = new Set<ChannelType>();
		for (const typeResolvable of types) {
			for (const type of this.resolveConstructorPreConditionsRunType(typeResolvable) ?? []) resolved.add(type);
		}

		// If all types were resolved, optimize to null:
		if (resolved.size === ChannelTypes.length) return null;

		// Return the resolved types in ascending order:
		return [...resolved].sort((a, b) => a - b);
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
	export type Interaction<Cached extends import('discord.js').CacheType = import('discord.js').CacheType> = ChatInputCommandInteraction<Cached>;
	export type Registry = ApplicationCommandRegistry;
}

export type ContextMenuCommand = Command & Required<Pick<Command, 'contextMenuRun'>>;

export namespace ContextMenuCommand {
	export type Options = CommandOptions;
	export type JSON = CommandJSON;
	export type Context = AliasPiece.Context;
	export type RunInTypes = CommandOptionsRunType;
	export type RunContext = ContextMenuCommandContext;
	export type Interaction<Cached extends import('discord.js').CacheType = import('discord.js').CacheType> = ContextMenuCommandInteraction<Cached>;
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
 * @remark It is discouraged to use this type, we recommend using {@link CommandOptionsRunTypeEnum} instead.
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
export enum CommandOptionsRunTypeEnum {
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
export enum CommandPreConditions {
	Cooldown = 'Cooldown',
	/** @deprecated Use {@link RunIn} instead. */
	DirectMessageOnly = 'DMOnly',
	RunIn = 'RunIn',
	/** @deprecated Use {@link RunIn} instead. */
	GuildNewsOnly = 'GuildNewsOnly',
	/** @deprecated Use {@link RunIn} instead. */
	GuildNewsThreadOnly = 'GuildNewsThreadOnly',
	/** @deprecated Use {@link RunIn} instead. */
	GuildOnly = 'GuildOnly',
	/** @deprecated Use {@link RunIn} instead. */
	GuildPrivateThreadOnly = 'GuildPrivateThreadOnly',
	/** @deprecated Use {@link RunIn} instead. */
	GuildPublicThreadOnly = 'GuildPublicThreadOnly',
	/** @deprecated Use {@link RunIn} instead. */
	GuildTextOnly = 'GuildTextOnly',
	/** @deprecated Use {@link RunIn} instead. */
	GuildVoiceOnly = 'GuildVoiceOnly',
	/** @deprecated Use {@link RunIn} instead. */
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
	 * Sets whether the command should be treated as NSFW. If set to true, the `NSFW` precondition will be added to the list.
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
	runIn?:
		| ChannelType
		| Command.RunInTypes
		| CommandOptionsRunTypeEnum
		| readonly (ChannelType | Command.RunInTypes | CommandOptionsRunTypeEnum)[]
		| null;

	/**
	 * If {@link SapphireClient.typing} is true, this option will override it.
	 * Otherwise, this option has no effect - you may call {@link Channel#sendTyping}` in the run method if you want specific commands to display the typing status.
	 * @default true
	 */
	typing?: boolean;
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
	export type ChatInputCommandInteraction<Cached extends import('discord.js').CacheType = import('discord.js').CacheType> =
		import('discord.js').ChatInputCommandInteraction<Cached>;
	export type ContextMenuCommandInteraction<Cached extends import('discord.js').CacheType = import('discord.js').CacheType> =
		import('discord.js').ContextMenuCommandInteraction<Cached>;
	export type AutocompleteInteraction<Cached extends import('discord.js').CacheType = import('discord.js').CacheType> =
		import('discord.js').AutocompleteInteraction<Cached>;
	export type Registry = ApplicationCommandRegistry;
}

export type DetailedDescriptionCommand = string | DetailedDescriptionCommandObject;

export interface DetailedDescriptionCommandObject extends NonNullObject {}
