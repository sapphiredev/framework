import type { PieceContext } from '@sapphire/pieces';
import type { Interaction } from 'discord.js';
import { Listener } from '../lib/structures/Listener';
import { Events } from '../lib/types/Events';

export class CoreEvent extends Listener<typeof Events.InteractionCreate> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.InteractionCreate });
	}

	public async run(interaction: Interaction) {
		if (interaction.isCommand() || interaction.isContextMenu()) {
			// TODO(vladfrangu): Slashies baby
		} else {
			await this.container.stores.get('interaction-handlers').run(interaction);
		}
	}
}
