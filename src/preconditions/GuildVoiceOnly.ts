import type { CommandInteraction, ContextMenuInteraction, Message, TextBasedChannelTypes } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { AllFlowsPrecondition } from '../lib/structures/Precondition';

export class CorePrecondition extends AllFlowsPrecondition {
	private readonly allowedTypes: TextBasedChannelTypes[] = ['GUILD_VOICE'];

	public messageRun(message: Message) {
		return this.allowedTypes.includes(message.channel.type)
			? this.ok()
			: this.error({
					identifier: Identifiers.PreconditionGuildVoiceOnly,
					message: 'You can only run this message command in server voice channels.'
			  });
	}

	public async chatInputRun(interaction: CommandInteraction) {
		const channel = await this.fetchChannelFromInteraction(interaction);

		return this.allowedTypes.includes(channel.type)
			? this.ok()
			: this.error({
					identifier: Identifiers.PreconditionGuildVoiceOnly,
					message: 'You can only run this chat input command in server voice channels.'
			  });
	}

	public async contextMenuRun(interaction: ContextMenuInteraction) {
		const channel = await this.fetchChannelFromInteraction(interaction);

		return this.allowedTypes.includes(channel.type)
			? this.ok()
			: this.error({
					identifier: Identifiers.PreconditionGuildVoiceOnly,
					message: 'You can only run this context menu command in server voice channels.'
			  });
	}
}