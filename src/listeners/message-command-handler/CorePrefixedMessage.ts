import type { PieceContext } from '@sapphire/pieces';
import type { Message } from 'discord.js';
import type { MessageCommand } from '../../lib/structures/Command';
import { Listener } from '../../lib/structures/Listener';
import { Events } from '../../lib/types/Events';

export class CoreListener extends Listener {
	public constructor(context: PieceContext) {
		super(context, { event: Events.PrefixedMessage });
	}

	public run(message: Message, prefix: string | RegExp) {
		const { client, stores } = this.container;
		// Retrieve the command name and validate:
		const commandPrefix = this.getCommandPrefix(message.content, prefix);
		const prefixLess = message.content.slice(commandPrefix.length).trim();

		// The character that separates the command name from the arguments, this will return -1 when '[p]command' is
		// passed, and a non -1 value when '[p]command arg' is passed instead.
		const spaceIndex = prefixLess.indexOf(' ');
		const commandName = spaceIndex === -1 ? prefixLess : prefixLess.slice(0, spaceIndex);
		if (commandName.length === 0) {
			client.emit(Events.UnknownMessageCommandName, { message, prefix, commandPrefix });
			return;
		}

		// Retrieve the command and validate:
		const command = stores.get('commands').get(client.options.caseInsensitiveCommands ? commandName.toLowerCase() : commandName);
		if (!command) {
			client.emit(Events.UnknownMessageCommand, { message, prefix, commandName, commandPrefix });
			return;
		}

		// If the command exists but is missing a message handler, emit a different event (maybe an application command variant exists)
		if (!command.messageRun) {
			client.emit(Events.CommandDoesNotHaveMessageCommandHandler, { message, prefix, commandPrefix, command });
			return;
		}

		// Run the last stage before running the command:
		// TODO(vladfrangu): substr is deprecated!
		const parameters = spaceIndex === -1 ? '' : prefixLess.substr(spaceIndex + 1).trim();
		client.emit(Events.PreMessageCommandRun, {
			message,
			command: command as MessageCommand,
			parameters,
			context: { commandName, commandPrefix, prefix }
		});
	}

	private getCommandPrefix(content: string, prefix: string | RegExp): string {
		return typeof prefix === 'string' ? prefix : prefix.exec(content)![0];
	}
}
