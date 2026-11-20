import type { AliasPiece, AliasPieceJSON } from '@sapphire/pieces';
import type { Nullish } from '@sapphire/utilities';
import type {
	ChannelType,
	CacheType,
	ChatInputCommandInteraction,
	ContextMenuCommandInteraction,
	AutocompleteInteraction,
	PermissionResolvable,
	Snowflake
} from 'discord.js';
import type { Command } from '../structures/Command';
import type { Precondition } from '../structures/Precondition';
import type { SapphireClientOptions } from '../SapphireClient';
import type { ApplicationCommandRegistry } from '../utils/application-commands/ApplicationCommandRegistry';
import { PreconditionContainerArray, type PreconditionEntryResolvable } from '../utils/preconditions/PreconditionContainerArray';
import { type FlagStrategyOptions } from '../utils/strategies/FlagUnorderedStrategy';
import type { BucketScope, CommandOptionsRunTypeEnum } from './Enums';

export type DetailedDescriptionCommand = DetailedDescriptionCommandObject | string;

// Consumers augment this interface to define their detailed description shape.
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DetailedDescriptionCommandObject {}

/**
 * The allowed values for {@link CommandOptions.runIn}.
 *
 * @remarks It is discouraged to use this type, we recommend using {@link CommandOptionsRunTypeEnum} instead.
 *
 * Available since 2.0.0
 */
export type CommandOptionsRunType =
	'DM' | 'GUILD_ANY' | 'GUILD_NEWS_THREAD' | 'GUILD_NEWS' | 'GUILD_PRIVATE_THREAD' | 'GUILD_PUBLIC_THREAD' | 'GUILD_TEXT' | 'GUILD_VOICE';

/**
 * The allowed values for {@link CommandOptions.runIn}.
 *
 * @remarks Available since 4.7.0
 */
export type CommandRunInUnion =
	| ChannelType
	| Command.RunInTypes
	| CommandOptionsRunTypeEnum
	| Nullish
	| readonly (ChannelType | Command.RunInTypes | CommandOptionsRunTypeEnum)[];

/**
 * A more detailed structure for {@link CommandOptions.runIn} when you want to have a different `runIn` for each
 * command type.
 *
 * @remarks Available since 4.7.0
 */
export interface CommandSpecificRunIn {
	chatInputRun?: CommandRunInUnion;
	contextMenuRun?: CommandRunInUnion;
	messageRun?: CommandRunInUnion;
}

/**
 * The {@link Command} options.
 *
 * @remarks Available since 1.0.0
 */
export interface CommandOptions extends AliasPiece.Options, FlagStrategyOptions {
	/**
	 * The time in milliseconds for the cooldown entries to reset, if set to a non-zero value alongside {@link CommandOptions.cooldownLimit}, the `Cooldown` precondition will be added to the list.
	 *
	 * @remarks Available since 2.0.0
	 * @defaultValue 0
	 */
	cooldownDelay?: number;

	/**
	 * The users that are exempt from the Cooldown precondition.
	 * Use this to filter out someone like a bot owner
	 *
	 * @remarks Available since 2.0.0
	 * @defaultValue undefined
	 */
	cooldownFilteredUsers?: Snowflake[];

	/**
	 * The amount of entries the cooldown can have before filling up, if set to a non-zero value alongside {@link CommandOptions.cooldownDelay}, the `Cooldown` precondition will be added to the list.
	 *
	 * @remarks Available since 2.0.0
	 * @defaultValue 1
	 */
	cooldownLimit?: number;

	/**
	 * The scope of the cooldown entries.
	 *
	 * @remarks Available since 2.0.0
	 * @defaultValue BucketScope.User
	 */
	cooldownScope?: BucketScope;

	/**
	 * The description for the command.
	 *
	 * @remarks Available since 1.0.0
	 * @defaultValue ''
	 */
	description?: string;

	/**
	 * The detailed description for the command.
	 *
	 * @remarks Available since 1.0.0
	 * @defaultValue ''
	 */
	detailedDescription?: DetailedDescriptionCommand;

	/**
	 * The full category path for the command
	 *
	 * @remarks Available since 2.0.0
	 * @defaultValue 'An array of folder names that lead back to the folder that is registered for in the commands store'
	 * @example
	 * ```typescript
	 * // Given a file named `ping.js` at the path of `commands/General/ping.js`
	 * ['General']
	 *
	 * // Given a file named `info.js` at the path of `commands/General/About/info.js`
	 * ['General', 'About']
	 * ```
	 */
	fullCategory?: string[];

	/**
	 * Whether to add aliases for commands with dashes in them
	 *
	 * @remarks Available since 1.0.0
	 * @defaultValue false
	 */
	generateDashLessAliases?: boolean;

	/**
	 * Whether to add aliases for commands with underscores in them
	 *
	 * @remarks Available since 3.0.0
	 * @defaultValue false
	 */
	generateUnderscoreLessAliases?: boolean;

	/**
	 * Sets whether the command should be treated as NSFW. If set to true, the `NSFW` precondition will be added to the list.
	 *
	 * @remarks Available since 2.0.0
	 * @defaultValue false
	 */
	nsfw?: boolean;

	/**
	 * The {@link Precondition}s to be run, accepts an array of their names.
	 *
	 * @see {@link PreconditionContainerArray}
	 * @remarks Available since 1.0.0
	 * @defaultValue `[]`
	 */
	preconditions?: readonly PreconditionEntryResolvable[];

	/**
	 * The quotes accepted by this command, pass `[]` to disable them.
	 *
	 * @remarks Available since 1.0.0
	 * @defaultValue
	 * [
	 *   ['"', '"'], // Double quotes
	 *   ['“', '”'], // Fancy quotes (on iOS)
	 *   ['「', '」'] // Corner brackets (CJK)
	 *   ['«', '»'] // French quotes (guillemets)
	 * ]
	 */
	quotes?: [string, string][];

	/**
	 * The required permissions for the client.
	 *
	 * @remarks Available since 2.0.0
	 * @defaultValue 0
	 */
	requiredClientPermissions?: PermissionResolvable;

	/**
	 * The required permissions for the user.
	 *
	 * @remarks Available since 2.0.0
	 * @defaultValue 0
	 */
	requiredUserPermissions?: PermissionResolvable;

	/**
	 * The channels the command should run in. If set to `null`, no precondition entry will be added.
	 * Some optimizations are applied when given an array to reduce the amount of preconditions run
	 * (e.g. `'GUILD_TEXT'` and `'GUILD_NEWS'` becomes `'GUILD_ANY'`, and if both `'DM'` and `'GUILD_ANY'` are defined,
	 * then no precondition entry is added as it runs in all channels).
	 *
	 * This can be both {@link CommandRunInUnion} which will have the same precondition apply to all the types of commands,
	 * or you can use {@link CommandSpecificRunIn} to apply different preconditions to different types of commands.
	 *
	 * @remarks Available since 2.0.0
	 * @defaultValue null
	 */
	runIn?: CommandRunInUnion | CommandSpecificRunIn;

	/**
	 * If {@link SapphireClientOptions.typing} is true, this option will override it.
	 * Otherwise, this option has no effect - you may call `channel.sendTyping()` in the run method if you want specific commands to display the typing status.
	 *
	 * @defaultValue true
	 */
	typing?: boolean;
}

export interface MessageCommandContext extends Record<PropertyKey, unknown> {
	/**
	 * The alias used to run this command.
	 */
	commandName: string;
	/**
	 * The matched prefix, this will always be the same as {@link MessageCommand.RunContext.prefix} if it was a string, otherwise it is
	 * the result of doing `prefix.exec(content)[0]`.
	 */
	commandPrefix: string;
	/**
	 * The prefix used to run this command.
	 *
	 * This is a string for the mention and default prefix, and a RegExp for the `regexPrefix`.
	 */
	prefix: RegExp | string;
}

export interface ChatInputCommandContext extends Record<PropertyKey, unknown> {
	/**
	 * The id of the command.
	 */
	commandId: string;
	/**
	 * The name of the command.
	 */
	commandName: string;
}

export interface ContextMenuCommandContext extends Record<PropertyKey, unknown> {
	/**
	 * The id of the command.
	 */
	commandId: string;
	/**
	 * The name of the command.
	 */
	commandName: string;
}

export interface AutocompleteCommandContext extends Record<PropertyKey, unknown> {
	/**
	 * The id of the command.
	 */
	commandId: string;
	/**
	 * The name of the command.
	 */
	commandName: string;
}

export interface CommandJSON extends AliasPieceJSON {
	category: string | null;
	description: string;
	detailedDescription: DetailedDescriptionCommand;
}

export type AutocompleteCommand = Command & Required<Pick<Command, 'autocompleteRun'>>;

export declare namespace AutocompleteCommand {
	export type Options = Command.Options;
	export type JSON = Command.JSON;
	export type LoaderContext = Command.LoaderContext;
	export type RunInTypes = CommandOptionsRunType;
	export type RunContext = AutocompleteCommandContext;
	export type Interaction<Cached extends CacheType = CacheType> = AutocompleteInteraction<Cached>;
	export type Registry = ApplicationCommandRegistry;
}

export type ContextMenuCommand = Command & Required<Pick<Command, 'contextMenuRun'>>;

export declare namespace ContextMenuCommand {
	export type Options = Command.Options;
	export type JSON = Command.JSON;
	export type LoaderContext = Command.LoaderContext;
	export type RunInTypes = CommandOptionsRunType;
	export type RunContext = ContextMenuCommandContext;
	export type Interaction<Cached extends CacheType = CacheType> = ContextMenuCommandInteraction<Cached>;
	export type Registry = ApplicationCommandRegistry;
}

export type MessageCommand = Command & Required<Pick<Command, 'messageRun'>>;

export declare namespace MessageCommand {
	export type Options = Command.Options;
	export type JSON = Command.JSON;
	export type LoaderContext = Command.LoaderContext;
	export type RunInTypes = CommandOptionsRunType;
	export type RunContext = MessageCommandContext;
}

export type ChatInputCommand = Command & Required<Pick<Command, 'chatInputRun'>>;

export declare namespace ChatInputCommand {
	export type Options = Command.Options;
	export type JSON = Command.JSON;
	export type LoaderContext = Command.LoaderContext;
	export type RunInTypes = CommandOptionsRunType;
	export type RunContext = ChatInputCommandContext;
	export type Interaction<Cached extends CacheType = CacheType> = ChatInputCommandInteraction<Cached>;
	export type Registry = ApplicationCommandRegistry;
}
