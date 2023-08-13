import type { ChatInputCommandInteraction, ContextMenuCommandInteraction, Message } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { AllFlowsPrecondition } from '../lib/structures/Precondition';

export class CorePrecondition extends AllFlowsPrecondition {
	public messageRun(message: Message): AllFlowsPrecondition.Result {
		return message.guildId === null ? this.makeSharedError() : this.ok();
	}

	public chatInputRun(interaction: ChatInputCommandInteraction): AllFlowsPrecondition.Result {
		return interaction.guildId === null ? this.makeSharedError() : this.ok();
	}

	public contextMenuRun(interaction: ContextMenuCommandInteraction): AllFlowsPrecondition.Result {
		return interaction.guildId === null ? this.makeSharedError() : this.ok();
	}

	private makeSharedError(): AllFlowsPrecondition.Result {
		return this.error({
			// eslint-disable-next-line deprecation/deprecation
			identifier: Identifiers.PreconditionGuildOnly,
			message: 'You cannot run this context menu command in DMs.'
		});
	}
}
