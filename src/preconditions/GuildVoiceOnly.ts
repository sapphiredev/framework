import { isVoiceChannel } from '@sapphire/discord.js-utilities';
import type { CommandInteraction, ContextMenuInteraction, Message } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { AllFlowsPrecondition } from '../lib/structures/Precondition';

export class CorePrecondition extends AllFlowsPrecondition {
	public messageRun(message: Message): AllFlowsPrecondition.Result {
		return isVoiceChannel(message.channel)
			? this.ok()
			: this.error({
					identifier: Identifiers.PreconditionGuildVoiceOnly,
					message: 'You can only run this message command in server voice channels.'
			  });
	}

	public async chatInputRun(interaction: CommandInteraction): AllFlowsPrecondition.AsyncResult {
		const channel = await this.fetchChannelFromInteraction(interaction);

		return isVoiceChannel(channel)
			? this.ok()
			: this.error({
					identifier: Identifiers.PreconditionGuildVoiceOnly,
					message: 'You can only run this chat input command in server voice channels.'
			  });
	}

	public async contextMenuRun(interaction: ContextMenuInteraction): AllFlowsPrecondition.AsyncResult {
		const channel = await this.fetchChannelFromInteraction(interaction);

		return isVoiceChannel(channel)
			? this.ok()
			: this.error({
					identifier: Identifiers.PreconditionGuildVoiceOnly,
					message: 'You can only run this context menu command in server voice channels.'
			  });
	}
}
