import { container } from '@sapphire/pieces';
import type { AutocompleteInteraction } from 'discord.js';
import { Listener } from '../../lib/structures/Listener';
import type { AutocompleteCommand } from '../../lib/types/CommandTypes';
import { Events } from '../../lib/types/Events';

export class CoreListener extends Listener<typeof Events.PossibleAutocompleteInteraction> {
	public constructor(context: Listener.Context) {
		super(context, { event: Events.PossibleAutocompleteInteraction });
	}

	public async run(interaction: AutocompleteInteraction) {
		const { stores } = this.container;

		const commandStore = stores.get('commands');

		// Try resolving in command
		const command = commandStore.get(interaction.commandId) ?? commandStore.get(interaction.commandName);

		if (command?.autocompleteRun) {
			try {
				await command.autocompleteRun(interaction);
				this.container.client.emit(Events.CommandAutocompleteInteractionSuccess, {
					command: command as AutocompleteCommand,
					context: { commandId: interaction.commandId, commandName: interaction.commandName },
					interaction
				});
			} catch (err) {
				this.container.client.emit(Events.CommandAutocompleteInteractionError, err, {
					command: command as AutocompleteCommand,
					context: { commandId: interaction.commandId, commandName: interaction.commandName },
					interaction
				});
			}
			return;
		}

		// Unless we ran a command handler, always call interaction handlers with the interaction
		await this.container.stores.get('interaction-handlers').run(interaction);
	}
}

void container.stores.loadPiece({
	name: 'CorePossibleAutocompleteInteraction',
	piece: CoreListener,
	store: 'listeners'
});
