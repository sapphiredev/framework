import type { CommandInteraction, ContextMenuInteraction, Message } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { AllFlowsPrecondition } from '../lib/structures/Precondition';
import { isVoiceChannel } from '@sapphire/discord.js-utilities';

export class CorePrecondition extends AllFlowsPrecondition {
	public messageRun(message: Message) {
		return isVoiceChannel(message.channel)
			? this.ok()
			: this.error({
					identifier: Identifiers.PreconditionGuildVoiceOnly,
					message: 'You can only run this message command in server voice channels.'
			  });
	}

	public async chatInputRun(interaction: CommandInteraction) {
		const channel = await this.fetchChannelFromInteraction(interaction);

		return isVoiceChannel(channel)
			? this.ok()
			: this.error({
					identifier: Identifiers.PreconditionGuildVoiceOnly,
					message: 'You can only run this chat input command in server voice channels.'
			  });
	}

	public async contextMenuRun(interaction: ContextMenuInteraction) {
		const channel = await this.fetchChannelFromInteraction(interaction);

		return isVoiceChannel(channel)
			? this.ok()
			: this.error({
					identifier: Identifiers.PreconditionGuildVoiceOnly,
					message: 'You can only run this context menu command in server voice channels.'
			  });
	}
}
