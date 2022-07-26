import type { PieceContext } from '@sapphire/pieces';
import { InteractionType, type Interaction } from 'discord.js';
import { Listener } from '../lib/structures/Listener';
import { Events } from '../lib/types/Events';

export class CoreEvent extends Listener<typeof Events.InteractionCreate> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.InteractionCreate });
	}

	public async run(interaction: Interaction) {
		if (interaction.isChatInputCommand()) {
			this.container.client.emit(Events.PossibleChatInputCommand, interaction);
		} else if (interaction.isContextMenuCommand()) {
			this.container.client.emit(Events.PossibleContextMenuCommand, interaction);
		} else if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
			this.container.client.emit(Events.PossibleAutocompleteInteraction, interaction);
		} else if (interaction.type === InteractionType.MessageComponent || interaction.type === InteractionType.ModalSubmit) {
			await this.container.stores.get('interaction-handlers').run(interaction);
		} else {
			this.container.logger.warn(`[Sapphire ${this.location.name}] Unhandled interaction type: ${(interaction as Interaction).type}`);
		}
	}
}
