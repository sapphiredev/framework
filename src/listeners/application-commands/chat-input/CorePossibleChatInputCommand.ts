import type { PieceContext } from '@sapphire/pieces';
import type { CommandInteraction } from 'discord.js';
import type { ChatInputCommand } from '../../../lib/structures/Command';
import { Listener } from '../../../lib/structures/Listener';
import { SapphireEvents } from '../../../lib/types/Events';

export class CoreListener extends Listener<typeof SapphireEvents.PossibleChatInputCommand> {
	public constructor(context: PieceContext) {
		super(context, { event: SapphireEvents.PossibleChatInputCommand });
	}

	public run(interaction: CommandInteraction) {
		const { client, stores } = this.container;
		const commandStore = stores.get('commands');

		const command = commandStore.get(interaction.commandId) ?? commandStore.get(interaction.commandName);
		if (!command) {
			client.emit(SapphireEvents.UnknownChatInputCommand, {
				interaction,
				context: { commandId: interaction.commandId, commandName: interaction.commandName }
			});
			return;
		}

		if (!command.chatInputRun) {
			client.emit(SapphireEvents.CommandDoesNotHaveChatInputCommandHandler, {
				command,
				interaction,
				context: { commandId: interaction.commandId, commandName: interaction.commandName }
			});
			return;
		}

		client.emit(SapphireEvents.PreChatInputCommandRun, {
			command: command as ChatInputCommand,
			context: { commandId: interaction.commandId, commandName: interaction.commandName },
			interaction
		});
	}
}
