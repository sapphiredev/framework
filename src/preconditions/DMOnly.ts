import type { CommandInteraction, ContextMenuCommandInteraction, Message } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { AllFlowsPrecondition } from '../lib/structures/Precondition';

export class CorePrecondition extends AllFlowsPrecondition {
	public messageRun(message: Message) {
		return message.guild === null
			? this.ok()
			: this.error({ identifier: Identifiers.PreconditionDMOnly, message: 'You cannot run this message command outside DMs.' });
	}

	public chatInputRun(interaction: CommandInteraction) {
		return interaction.guildId === null
			? this.ok()
			: this.error({ identifier: Identifiers.PreconditionDMOnly, message: 'You cannot run this chat input command outside DMs.' });
	}

	public contextMenuRun(interaction: ContextMenuCommandInteraction) {
		return interaction.guildId === null
			? this.ok()
			: this.error({ identifier: Identifiers.PreconditionDMOnly, message: 'You cannot run this context menu command outside DMs.' });
	}
}
