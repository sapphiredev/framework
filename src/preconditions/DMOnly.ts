import type { ChatInputCommandInteraction, ContextMenuCommandInteraction, Message } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { AllFlowsPrecondition } from '../lib/structures/Precondition';
import { container } from '@sapphire/pieces';

export class CorePrecondition extends AllFlowsPrecondition {
	public messageRun(message: Message): AllFlowsPrecondition.Result {
		return message.guild === null ? this.ok() : this.makeSharedError();
	}

	public chatInputRun(interaction: ChatInputCommandInteraction): AllFlowsPrecondition.Result {
		return interaction.guildId === null ? this.ok() : this.makeSharedError();
	}

	public contextMenuRun(interaction: ContextMenuCommandInteraction): AllFlowsPrecondition.Result {
		return interaction.guildId === null ? this.ok() : this.makeSharedError();
	}

	private makeSharedError(): AllFlowsPrecondition.Result {
		return this.error({
			// eslint-disable-next-line deprecation/deprecation
			identifier: Identifiers.PreconditionDMOnly,
			message: 'You cannot run this command outside DMs.'
		});
	}
}

void container.stores.loadPiece({
	name: 'DMOnly',
	piece: CorePrecondition,
	store: 'preconditions'
});
