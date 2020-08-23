import type { PieceContext } from '@sapphire/pieces';
import type { Message } from 'discord.js';
import { Event } from '../../lib/structures/Event';

export class CoreEvent extends Event {
	public constructor(context: PieceContext) {
		super(context, { event: 'prefixedMessage' });
	}

	public run(message: Message, prefix: string) {
		// Retrieve the command name and validate:
		const prefixLess = message.content.slice(prefix.length).trim();
		const commandName = /.+\b/.exec(prefixLess)?.[0];
		if (!commandName) {
			this.client.emit('unknownCommandName', message, prefix);
			return;
		}

		// Retrieve the command and validate:
		const command = this.client.commands.get(commandName);
		if (!command) {
			this.client.emit('unknownCommand', message, commandName, prefix);
			return;
		}

		// Run the last stage before running the command:
		this.client.emit('preCommandRun', message, command, commandName, prefix);
	}
}
