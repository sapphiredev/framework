import { ChannelType, ChatInputCommandInteraction, ContextMenuCommandInteraction, Message } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { AllFlowsPrecondition } from '../lib/structures/Precondition';

export class CorePrecondition extends AllFlowsPrecondition {
	public messageRun(message: Message): AllFlowsPrecondition.Result {
		return message.thread?.type === ChannelType.GuildPrivateThread
			? this.ok()
			: this.error({
					identifier: Identifiers.PreconditionGuildPrivateThreadOnly,
					message: 'You can only run this message command in private server thread channels.'
			  });
	}

	public async chatInputRun(interaction: ChatInputCommandInteraction): AllFlowsPrecondition.AsyncResult {
		const channel = await this.fetchChannelFromInteraction(interaction);

		return channel.type === ChannelType.GuildPrivateThread
			? this.ok()
			: this.error({
					identifier: Identifiers.PreconditionGuildPrivateThreadOnly,
					message: 'You can only run this chat input command in private server thread channels.'
			  });
	}

	public async contextMenuRun(interaction: ContextMenuCommandInteraction): AllFlowsPrecondition.AsyncResult {
		const channel = await this.fetchChannelFromInteraction(interaction);

		return channel.type === ChannelType.GuildPrivateThread
			? this.ok()
			: this.error({
					identifier: Identifiers.PreconditionGuildPrivateThreadOnly,
					message: 'You can only run this context menu command in private server thread channels.'
			  });
	}
}
