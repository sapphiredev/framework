import { AliasPiece, type AliasPieceJSON } from '@sapphire/pieces';
import { type NonNullObject, type Nullish } from '@sapphire/utilities';
import {
	ChannelType,
	ChatInputCommandInteraction,
	ContextMenuCommandInteraction,
	type AutocompleteInteraction,
	type PermissionResolvable,
	type Snowflake
} from 'discord.js';
import type { Command } from '../structures/Command';
import type { ApplicationCommandRegistry } from '../utils/application-commands/ApplicationCommandRegistry';
import { PreconditionContainerArray, type PreconditionEntryResolvable } from '../utils/preconditions/PreconditionContainerArray';
import { type FlagStrategyOptions } from '../utils/strategies/FlagUnorderedStrategy';
import { BucketScope, CommandOptionsRunTypeEnum } from './Enums';

export type DetailedDescriptionCommand = string | DetailedDescriptionCommandObject;

export interface DetailedDescriptionCommandObject extends NonNullObject {}

/**
 * The allowed values for {@link CommandOptions.runIn}.
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
 * The allowed values for {@link CommandOptions.runIn}.
 * @since 4.7.0
 */
export type CommandRunInUnion =
	| ChannelType
	| Command.RunInTypes
	| CommandOptionsRunTypeEnum
	| readonly (ChannelType | Command.RunInTypes | CommandOptionsRunTypeEnum)[]
	| Nullish;

/**
 * A more detailed structure for {@link CommandOptions.runIn} when you want to have a different `runIn` for each
 * command type.
 * @since 4.7.0
 */
export interface CommandSpecificRunIn {
	chatInputRun?: CommandRunInUnion;
	messageRun?: CommandRunInUnion;
	contextMenuRun?: CommandRunInUnion;
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
	 * The required permissions for the user.
	 * @since 2.0.0
	 * @default 0
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
	 * @since 2.0.0
	 * @default null
	 */
	runIn?: CommandRunInUnion | CommandSpecificRunIn;

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
