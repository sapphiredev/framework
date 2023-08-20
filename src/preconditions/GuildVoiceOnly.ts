import { isVoiceChannel } from '@sapphire/discord.js-utilities';
import type { ChatInputCommandInteraction, ContextMenuCommandInteraction, Message } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { AllFlowsPrecondition } from '../lib/structures/Precondition';

export class CorePrecondition extends AllFlowsPrecondition {
	public messageRun(message: Message): AllFlowsPrecondition.Result {
		return isVoiceChannel(message.channel) ? this.ok() : this.makeSharedError();
	}

	public async chatInputRun(interaction: ChatInputCommandInteraction): AllFlowsPrecondition.AsyncResult {
		const channel = await this.fetchChannelFromInteraction(interaction);
		return isVoiceChannel(channel) ? this.ok() : this.makeSharedError();
	}

	public async contextMenuRun(interaction: ContextMenuCommandInteraction): AllFlowsPrecondition.AsyncResult {
		const channel = await this.fetchChannelFromInteraction(interaction);
		return isVoiceChannel(channel) ? this.ok() : this.makeSharedError();
	}

	private makeSharedError(): AllFlowsPrecondition.Result {
		return this.error({
			// eslint-disable-next-line deprecation/deprecation
			identifier: Identifiers.PreconditionGuildVoiceOnly,
			message: 'You can only run this command in server voice channels.'
		});
	}
}
