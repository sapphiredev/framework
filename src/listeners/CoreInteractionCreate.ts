import { container } from '@sapphire/pieces';
import type { Interaction } from 'discord.js';
import { Listener } from '../lib/structures/Listener';
import { Events } from '../lib/types/Events';

export class CoreListener extends Listener<typeof Events.InteractionCreate> {
	public constructor(context: Listener.LoaderContext) {
		super(context, { event: Events.InteractionCreate });
	}

	public async run(interaction: Interaction) {
		if (interaction.isChatInputCommand()) {
			this.container.client.emit(Events.PossibleChatInputCommand, interaction);
		} else if (interaction.isContextMenuCommand()) {
			this.container.client.emit(Events.PossibleContextMenuCommand, interaction);
		} else if (interaction.isAutocomplete()) {
			this.container.client.emit(Events.PossibleAutocompleteInteraction, interaction);
		} else if (interaction.isMessageComponent() || interaction.isModalSubmit()) {
			await this.container.stores.get('interaction-handlers').run(interaction);
		} else {
			this.container.logger.warn(`[Sapphire ${this.location.name}] Unhandled interaction type: ${(interaction as any).constructor.name}`);
		}
	}
}

void container.stores.loadPiece({
	name: 'CoreInteractionCreate',
	piece: CoreListener,
	store: 'listeners'
});
