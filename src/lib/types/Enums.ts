import type { CommandOptions } from './CommandTypes';
import type { ApplicationCommandRegistry } from '../utils/application-commands/ApplicationCommandRegistry';

export enum CooldownLevel {
	Author = 'author',
	Channel = 'channel',
	Guild = 'guild'
}

export enum PluginHook {
	PostInitialization = 'postInitialization',
	PostLogin = 'postLogin',
	PreGenericsInitialization = 'preGenericsInitialization',
	PreInitialization = 'preInitialization',
	PreLogin = 'preLogin'
}

/**
 * The scope the cooldown applies to.
 */
export enum BucketScope {
	/**
	 * Per channel cooldowns.
	 */
	Channel,
	/**
	 * Global cooldowns.
	 */
	Global,
	/**
	 * Per guild cooldowns.
	 */
	Guild,
	/**
	 * Per user cooldowns.
	 */
	User
}

export enum RegisterBehavior {
	/**
	 * Makes Sapphire handle all command registrations, removals, and updates for you.
	 *
	 * This mode can only be set as the **default** behavior, and cannot be set per-command.
	 *
	 * In this mode:
	 * - any `idHints` set per-command are no longer respected, and can be omitted.
	 * - any `behaviorWhenNotIdentical` that are set per-command are no longer respected, and can be omitted.
	 * - any application commands that are *not* registered through Sapphire's {@link ApplicationCommandRegistry} are removed from the application.
	 * 	- the same applies for guild commands, but only for guilds that are registered in the registry via `guildIds`.
	 */
	BulkOverwrite = 'BULK_OVERWRITE',
	LogToConsole = 'LOG_TO_CONSOLE',
	Overwrite = 'OVERWRITE',
	/**
	 * Finds all differences in the commands provided using our internal computation method, and logs them to the console, while applying them.
	 *
	 * @remarks **Warning:** This can potentially cause slowdowns when booting up your bot as computing differences on big commands can take a while.
	 * We recommend you use `OVERWRITE` instead in production.
	 */
	VerboseOverwrite = 'VERBOSE_OVERWRITE'
}

export enum InternalRegistryAPIType {
	ChatInput,
	ContextMenu
}

/**
 * The allowed values for {@link CommandOptions.runIn} as an enum.
 *
 * @remarks Available since 2.0.0
 */
export enum CommandOptionsRunTypeEnum {
	Dm = 'DM',
	GuildAny = 'GUILD_ANY',
	GuildNews = 'GUILD_NEWS',
	GuildNewsThread = 'GUILD_NEWS_THREAD',
	GuildPrivateThread = 'GUILD_PRIVATE_THREAD',
	GuildPublicThread = 'GUILD_PUBLIC_THREAD',
	GuildText = 'GUILD_TEXT',
	GuildVoice = 'GUILD_VOICE'
}

/**
 * The available command pre-conditions.
 *
 * @remarks Available since 2.0.0
 */
export enum CommandPreConditions {
	ClientPermissions = 'ClientPermissions',
	Cooldown = 'Cooldown',
	/**
	 * @deprecated Use {@link RunIn} instead.
	 */
	DirectMessageOnly = 'DMOnly',
	/**
	 * @deprecated Use {@link RunIn} instead.
	 */
	GuildNewsOnly = 'GuildNewsOnly',
	/**
	 * @deprecated Use {@link RunIn} instead.
	 */
	GuildNewsThreadOnly = 'GuildNewsThreadOnly',
	/**
	 * @deprecated Use {@link RunIn} instead.
	 */
	GuildOnly = 'GuildOnly',
	/**
	 * @deprecated Use {@link RunIn} instead.
	 */
	GuildPrivateThreadOnly = 'GuildPrivateThreadOnly',
	/**
	 * @deprecated Use {@link RunIn} instead.
	 */
	GuildPublicThreadOnly = 'GuildPublicThreadOnly',
	/**
	 * @deprecated Use {@link RunIn} instead.
	 */
	GuildTextOnly = 'GuildTextOnly',
	/**
	 * @deprecated Use {@link RunIn} instead.
	 */
	GuildThreadOnly = 'GuildThreadOnly',
	/**
	 * @deprecated Use {@link RunIn} instead.
	 */
	GuildVoiceOnly = 'GuildVoiceOnly',
	NotSafeForWork = 'NSFW',
	RunIn = 'RunIn',
	UserPermissions = 'UserPermissions'
}
