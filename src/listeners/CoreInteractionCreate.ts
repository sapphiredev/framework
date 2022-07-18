import type { PieceContext } from '@sapphire/pieces';
import { AutocompleteInteraction, BaseInteraction, InteractionType } from 'discord.js';
import { Listener } from '../lib/structures/Listener';
import { SapphireEvents } from '../lib/types/Events';

export class CoreEvent extends Listener<typeof SapphireEvents.InteractionCreate> {
	public constructor(context: PieceContext) {
		super(context, { event: SapphireEvents.InteractionCreate });
	}

	public async run(interaction: BaseInteraction) {
		if (interaction.type === InteractionType.ApplicationCommand) {
			this.container.client.emit(SapphireEvents.PossibleChatInputCommand, interaction);
		} else if (interaction.isContextMenuCommand()) {
			this.container.client.emit(SapphireEvents.PossibleContextMenuCommand, interaction);
		} else if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
			this.container.client.emit(SapphireEvents.PossibleAutocompleteInteraction, interaction);
		} else if (interaction.type === InteractionType.MessageComponent || interaction.type === InteractionType.ModalSubmit) {
			await this.container.stores.get('interaction-handlers').run(interaction as AutocompleteInteraction);
		} else {
			this.container.logger.warn(`[Sapphire ${this.location.name}] Unhandled interaction type: ${interaction.constructor.name}`);
		}
	}
}
