import type { PieceContext } from '@sapphire/pieces';
import type { Message } from 'discord.js';
import { Event } from '../../lib/structures/Event';
import { Events } from '../../lib/types/Events';

export class CoreEvent extends Event<Events.PrefixedMessage> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.PrefixedMessage });
	}

	public run(message: Message, prefix: string | RegExp) {
		// Retrieve the command name and validate:
		const trimLength = typeof prefix === 'string' ? prefix.length : prefix.exec(message.content)?.[0].length ?? 0;
		const prefixLess = message.content.slice(trimLength).trim();
		const spaceIndex = prefixLess.indexOf(' ');
		const name = spaceIndex === -1 ? prefixLess : prefixLess.slice(0, spaceIndex);
		if (!name) {
			message.client.emit(Events.UnknownCommandName, message, prefix);
			return;
		}

		// Retrieve the command and validate:
		const command = message.client.commands.get(message.client.options.caseInsensitiveCommands ? name.toLowerCase() : name);
		if (!command) {
			message.client.emit(Events.UnknownCommand, message, name, prefix);
			return;
		}

		// Run the last stage before running the command:
		const parameters = spaceIndex === -1 ? '' : prefixLess.substr(spaceIndex + 1).trim();
		message.client.emit(Events.PreCommandRun, { message, command, parameters, context: { commandName: name, prefix } });
	}
}
