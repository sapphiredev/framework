import type { PieceContext } from '@sapphire/pieces';
import type { Message } from 'discord.js';
import { Event } from '../../lib/structures/Event';
import { Events } from '../../lib/types/Events';

export class CoreEvent extends Event<Events.PrefixedMessage> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.PrefixedMessage });
	}

	public run(message: Message, prefix: string | RegExp) {
		const { client, stores } = this.context;
		// Retrieve the command name and validate:
		const trimLength = typeof prefix === 'string' ? prefix.length : prefix.exec(message.content)?.[0].length ?? 0;
		const prefixLess = message.content.slice(trimLength).trim();
		const spaceIndex = prefixLess.indexOf(' ');
		const name = spaceIndex === -1 ? prefixLess : prefixLess.slice(0, spaceIndex);
		if (!name) {
			client.emit(Events.UnknownCommandName, message, prefix);
			return;
		}

		// Retrieve the command and validate:
		const command = stores.get('commands').get(client.options.caseInsensitiveCommands ? name.toLowerCase() : name);
		if (!command) {
			client.emit(Events.UnknownCommand, message, name, prefix);
			return;
		}

		// Run the last stage before running the command:
		const parameters = spaceIndex === -1 ? '' : prefixLess.substr(spaceIndex + 1).trim();
		client.emit(Events.PreCommandRun, { message, command, parameters, context: { commandName: name, prefix } });
	}
}
