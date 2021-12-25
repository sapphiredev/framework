import type { PieceContext } from '@sapphire/pieces';
import type { Interaction } from 'discord.js';
import { Listener } from '../lib/structures/Listener';
import { Events } from '../lib/types/Events';

export class CoreEvent extends Listener<typeof Events.InteractionCreate> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.InteractionCreate });
	}

	public async run(interaction: Interaction) {
		if (interaction.isCommand()) {
			this.container.client.emit(Events.PossibleChatInputCommand, interaction);
		} else if (interaction.isContextMenu()) {
			this.container.client.emit(Events.PossibleContextMenuCommand, interaction);
		} else if (interaction.isAutocomplete()) {
			this.container.client.emit(Events.PossibleAutocompleteInteraction, interaction);
		} else if (interaction.isMessageComponent()) {
			await this.container.stores.get('interaction-handlers').run(interaction);
		} else {
			this.container.logger.warn(`Unhandled interaction type: ${interaction.constructor.name}`);
		}
	}
}
