import type { PieceContext } from '@sapphire/pieces';
import type { ContextMenuCommandInteraction } from 'discord.js';
import type { ContextMenuCommand } from '../../../lib/structures/Command';
import { Listener } from '../../../lib/structures/Listener';
import { SapphireEvents } from '../../../lib/types/Events';

export class CoreListener extends Listener<typeof SapphireEvents.PossibleContextMenuCommand> {
	public constructor(context: PieceContext) {
		super(context, { event: SapphireEvents.PossibleContextMenuCommand });
	}

	public run(interaction: ContextMenuCommandInteraction) {
		const { client, stores } = this.container;
		const commandStore = stores.get('commands');

		const command = commandStore.get(interaction.commandId) ?? commandStore.get(interaction.commandName);
		if (!command) {
			client.emit(SapphireEvents.UnknownContextMenuCommand, {
				interaction,
				context: { commandId: interaction.commandId, commandName: interaction.commandName }
			});
			return;
		}

		if (!command.contextMenuRun) {
			client.emit(SapphireEvents.CommandDoesNotHaveContextMenuCommandHandler, {
				command,
				interaction,
				context: { commandId: interaction.commandId, commandName: interaction.commandName }
			});
			return;
		}

		client.emit(SapphireEvents.PreContextMenuCommandRun, {
			command: command as ContextMenuCommand,
			context: { commandId: interaction.commandId, commandName: interaction.commandName },
			interaction
		});
	}
}
