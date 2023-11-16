import { container } from '@sapphire/pieces';
import type { ChatInputCommandInteraction } from 'discord.js';
import { Listener } from '../../../lib/structures/Listener';
import type { ChatInputCommand } from '../../../lib/types/CommandTypes';
import { Events } from '../../../lib/types/Events';

export class CoreListener extends Listener<typeof Events.PossibleChatInputCommand> {
	public constructor(context: Listener.LoaderContext) {
		super(context, { event: Events.PossibleChatInputCommand });
	}

	public run(interaction: ChatInputCommandInteraction) {
		const { client, stores } = this.container;
		const commandStore = stores.get('commands');

		const command = commandStore.get(interaction.commandId) ?? commandStore.get(interaction.commandName);
		if (!command) {
			client.emit(Events.UnknownChatInputCommand, {
				interaction,
				context: { commandId: interaction.commandId, commandName: interaction.commandName }
			});
			return;
		}

		if (!command.chatInputRun) {
			client.emit(Events.CommandDoesNotHaveChatInputCommandHandler, {
				command,
				interaction,
				context: { commandId: interaction.commandId, commandName: interaction.commandName }
			});
			return;
		}

		client.emit(Events.PreChatInputCommandRun, {
			command: command as ChatInputCommand,
			context: { commandId: interaction.commandId, commandName: interaction.commandName },
			interaction
		});
	}
}

void container.stores.loadPiece({
	name: 'CorePossibleChatInputCommand',
	piece: CoreListener,
	store: 'listeners'
});
