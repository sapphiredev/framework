import { Client, ClientOptions, Message } from 'discord.js';
import { join } from 'path';
import { ArgumentStore } from './structures/ArgumentStore';
import { CommandStore } from './structures/CommandStore';
import { EventStore } from './structures/EventStore';
import { PreconditionStore } from './structures/PreconditionStore';
import type { Awaited } from './utils/Types';

export interface SapphirePrefixHook {
	(message: Message): Awaited<string | readonly string[] | null>;
}

export class SapphireClient extends Client {
	/**
	 * The client's ID, used for the user prefix.
	 */
	public clientID: string | null = null;

	/**
	 * The commands the framework has registered.
	 */
	public arguments: ArgumentStore;

	/**
	 * The commands the framework has registered.
	 */
	public commands: CommandStore;

	/**
	 * The events the framework has registered.
	 */
	public events: EventStore;

	/**
	 * The precondition the framework has registered.
	 */
	public preconditions: PreconditionStore;
	public constructor(options: ClientOptions = {}) {
		super(options);

		this.clientID = options.id ?? null;
		this.arguments = new ArgumentStore(this).registerPath(join(__dirname, '..', 'arguments'));
		this.commands = new CommandStore(this);
		this.events = new EventStore(this).registerPath(join(__dirname, '..', 'events'));
		this.preconditions = new PreconditionStore(this).registerPath(join(__dirname, '..', 'preconditions'));
	}

	/**
	 * The method to be overriden by the developer.
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
	 *   const guild = await driver.getOne('SELECT prefix FROM public.guild WHERE id = $1', [message.guild.id]);
	 *   return guild?.prefix ?? '!';
	 * };
	 * ```
	 * @example
	 * ```typescript
	 * // Retrieving the prefix from an ORM:
	 * client.fetchPrefix = async (message) => {
	 *   const guild = await driver.getRepository(GuildEntity).findOne({ id: message.guild.id });
	 *   return guild?.prefix ?? '!';
	 * };
	 * ```
	 */
	public fetchPrefix: SapphirePrefixHook = () => null;
}

declare module 'discord.js' {
	interface Client {
		id: string | null;
		arguments: ArgumentStore;
		commands: CommandStore;
		events: EventStore;
		preconditions: PreconditionStore;
		fetchPrefix: SapphirePrefixHook;
	}

	interface ClientOptions {
		id?: string;
	}
}
