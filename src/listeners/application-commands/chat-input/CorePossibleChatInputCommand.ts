import type { PieceContext } from '@sapphire/pieces';
import type { CommandInteraction } from 'discord.js';
import type { ChatInputCommand } from '../../../lib/structures/Command';
import { Listener } from '../../../lib/structures/Listener';
import { Events } from '../../../lib/types/Events';

export class CoreListener extends Listener<typeof Events.PossibleChatInputCommand> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.PossibleChatInputCommand });
	}

	public run(interaction: CommandInteraction) {
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
