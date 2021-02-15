import { Awaited, Store } from '@sapphire/pieces';
import { Client, ClientOptions, Message } from 'discord.js';
import { join } from 'path';
import type { Plugin } from './plugins/Plugin';
import { PluginManager } from './plugins/PluginManager';
import { ArgumentStore } from './structures/ArgumentStore';
import { CommandStore } from './structures/CommandStore';
import { EventStore } from './structures/EventStore';
import { PreconditionStore } from './structures/PreconditionStore';
import { EssentialStore } from './structures/EssentialStore';
import { StoreRegistry } from './structures/StoreRegistry';
import { PluginHook } from './types/Enums';
import { Events } from './types/Events';
import { ILogger, LogLevel } from './utils/logger/ILogger';
import { Logger } from './utils/logger/Logger';

/**
 * A valid prefix in Sapphire.
 * * `string`: a single prefix, e.g. `'!'`.
 * * `string[]`: an array of prefixes, e.g. `['!', '.']`.
 * * `null`: disabled prefix, locks the bot's command usage to mentions only.
 */
export type SapphirePrefix = string | readonly string[] | null;

export interface SapphirePrefixHook {
	(message: Message): Awaited<SapphirePrefix>;
}

export interface SapphireClientOptions {
	/**
	 * The base user directory, if set to `null`, Sapphire will not call [[SapphireClient.registerUserDirectories]],
	 * meaning that you will need to manually set each folder for each store. Please read the aforementioned method's
	 * documentation for more information.
	 * @since 1.0.0
	 * @default undefined
	 */
	baseUserDirectory?: string | null;

	/**
	 * Whether commands can be case insensitive
	 * @since 1.0.0
	 * @default false
	 */
	caseInsensitiveCommands?: boolean | null;

	/**
	 * Whether prefixes can be case insensitive
	 * @since 1.0.0
	 * @default false
	 */
	caseInsensitivePrefixes?: boolean | null;

	/**
	 * The default prefix, in case of `null`, only mention prefix will trigger the bot's commands.
	 * @since 1.0.0
	 * @default null
	 */
	defaultPrefix?: SapphirePrefix;

	/**
	 * The regex prefix, an alternative to a mention or regular prefix to allow creating natural language command messages
	 * @since 1.0.0
	 * @example
	 * ```ts
	 * /^(hey +)?bot[,! ]/i
	 *
	 * // Matches:
	 * // - hey bot,
	 * // - hey bot!
	 * // - hey bot
	 * // - bot,
	 * // - bot!
	 * // - bot
	 * ```
	 */
	regexPrefix?: RegExp;

	/**
	 * The prefix hook, by default it is a callback function that returns [[SapphireClientOptions.defaultPrefix]].
	 * @since 1.0.0
	 * @default () => client.options.defaultPrefix
	 */
	fetchPrefix?: SapphirePrefixHook;

	/**
	 * The client's ID, this is automatically set by the CoreReady event.
	 * @since 1.0.0
	 * @default this.client.user?.id ?? null
	 */
	id?: string;

	/**
	 * The logger options, defaults to an instance of [[Logger]] when [[ClientLoggerOptions.instance]] is not specified.
	 * @since 1.0.0
	 * @default { instance: new Logger(LogLevel.Info) }
	 */
	logger?: ClientLoggerOptions;

	/**
	 * If Sapphire should load our pre-included error event listeners that log any encountered errors to the [[SapphireClient.logger]] instance
	 * @since 1.0.0
	 * @default true
	 */
	loadDefaultErrorEvents?: boolean;
}

/**
 * The base [[Client]] extension that makes Sapphire work. When building a Discord bot with the framework, the developer
 * must either use this class, or extend it.
 *
 * Sapphire also automatically detects the folders to scan for pieces, please read
 * [[SapphireClient.registerUserDirectories]] for reference. This method is called at the start of the
 * [[SapphireClient.login]] method.
 *
 * @since 1.0.0
 * @example
 * ```typescript
 * const client = new SapphireClient({
 *   presence: {
 *     activity: {
 *       name: 'for commands!',
 *       type: 'LISTENING'
 *     }
 *   }
 * });
 *
 * client.login(process.env.DISCORD_TOKEN)
 *   .catch(console.error);
 * ```
 *
 * @example
 * ```typescript
 * // Automatically scan from a specific directory, e.g. the main
 * // file is at `/home/me/bot/index.js` and all your pieces are at
 * // `/home/me/bot/pieces` (e.g. `/home/me/bot/pieces/commands/MyCommand.js`):
 * const client = new SapphireClient({
 *   baseUserDirectory: join(__dirname, 'pieces'),
 *   // More options...
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Opt-out automatic scanning:
 * const client = new SapphireClient({
 *   baseUserDirectory: null,
 *   // More options...
 * });
 * ```
 */
export class SapphireClient extends Client {
	/**
	 * The client's ID, used for the user prefix.
	 * @since 1.0.0
	 */
	public id: string | null = null;

	/**
	 * The method to be overriden by the developer.
	 * @since 1.0.0
	 * @return A string for a single prefix, an array of strings for matching multiple, or null for no match (mention prefix only).
	 * @example
	 * ```typescript
	 * // Return always the same prefix (unconfigurable):
	 * client.fetchPrefix = () => '!';
	 * ```
	 * @example
	 * ```typescript
	 * // Retrieving the prefix from a SQL database:
	 * client.fetchPrefix = async (message) => {
	 *   // note: driver is something generic and depends on how you connect to your database
	 *   const guild = await driver.getOne('SELECT prefix FROM public.guild WHERE id = $1', [message.guild.id]);
	 *   return guild?.prefix ?? '!';
	 * };
	 * ```
	 * @example
	 * ```typescript
	 * // Retrieving the prefix from an ORM:
	 * client.fetchPrefix = async (message) => {
	 *   // note: driver is something generic and depends on how you connect to your database
	 *   const guild = await driver.getRepository(GuildEntity).findOne({ id: message.guild.id });
	 *   return guild?.prefix ?? '!';
	 * };
	 * ```
	 */
	public fetchPrefix: SapphirePrefixHook;

	/**
	 * The logger to be used by the framework and plugins. By default, a [[Logger]] instance is used, which emits the
	 * messages to the console.
	 * @since 1.0.0
	 */
	public logger: ILogger;

	/**
	 * The registered stores.
	 * @since 1.0.0
	 */
	public stores: StoreRegistry;

	public constructor(options: ClientOptions = {}) {
		super(options);

		Store.injectedContext.client = this;

		for (const plugin of SapphireClient.plugins.values(PluginHook.PreGenericsInitialization)) {
			plugin.hook.call(this, options);
			this.emit(Events.PluginLoaded, plugin.type, plugin.name);
		}

		this.logger = options.logger?.instance ?? new Logger(options.logger?.level ?? LogLevel.Info);
		Store.injectedContext.logger = this.logger;

		this.stores = new StoreRegistry();
		Store.injectedContext.stores = this.stores;

		this.fetchPrefix = options.fetchPrefix ?? (() => this.options.defaultPrefix ?? null);

		for (const plugin of SapphireClient.plugins.values(PluginHook.PreInitialization)) {
			plugin.hook.call(this, options);
			this.emit(Events.PluginLoaded, plugin.type, plugin.name);
		}

		this.id = options.id ?? null;
		this.stores
			.register(new ArgumentStore().registerPath(join(__dirname, '..', 'arguments'))) //
			.register(new CommandStore())
			.register(new EventStore().registerPath(join(__dirname, '..', 'events')))
			.register(new PreconditionStore().registerPath(join(__dirname, '..', 'preconditions')))
			.register(new EssentialStore().registerPath(join(__dirname, '..', 'essentials')));
		if (options.loadDefaultErrorEvents !== false) this.stores.get('events').registerPath(join(__dirname, '..', 'errorEvents'));

		for (const plugin of SapphireClient.plugins.values(PluginHook.PostInitialization)) {
			plugin.hook.call(this, options);
			this.emit(Events.PluginLoaded, plugin.type, plugin.name);
		}
	}

	/**
	 * Loads all pieces, then logs the client in, establishing a websocket connection to Discord.
	 * @since 1.0.0
	 * @param token Token of the account to log in with.
	 * @retrun Token of the account used.
	 */
	public async login(token?: string) {
		// Register the user directory if not null:
		if (this.options.baseUserDirectory !== null) {
			this.stores.registerUserDirectories(this.options.baseUserDirectory);
		}

		// Call pre-login plugins:
		for (const plugin of SapphireClient.plugins.values(PluginHook.PreLogin)) {
			await plugin.hook.call(this, this.options);
			this.emit(Events.PluginLoaded, plugin.type, plugin.name);
		}

		// Loads all stores, then call login:
		await Promise.all([...this.stores.values()].map((store) => store.loadAll()));
		const login = await super.login(token);

		// Call post-login plugins:
		for (const plugin of SapphireClient.plugins.values(PluginHook.PostLogin)) {
			await plugin.hook.call(this, this.options);
			this.emit(Events.PluginLoaded, plugin.type, plugin.name);
		}

		return login;
	}

	public static plugins = new PluginManager();

	public static use(plugin: typeof Plugin) {
		this.plugins.use(plugin);
		return this;
	}
}

export interface ClientLoggerOptions {
	level?: LogLevel;
	instance?: ILogger;
}

declare module 'discord.js' {
	interface Client {
		id: string | null;
		logger: ILogger;
		stores: StoreRegistry;
		fetchPrefix: SapphirePrefixHook;
	}

	interface ClientOptions extends SapphireClientOptions {}
}

declare module '@sapphire/pieces' {
	interface PieceContextExtras {
		client: SapphireClient;
		logger: ILogger;
		stores: StoreRegistry;
	}
}
