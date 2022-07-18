import { ChannelType, CommandInteraction, ContextMenuCommandInteraction, Message } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { AllFlowsPrecondition } from '../lib/structures/Precondition';

export class CorePrecondition extends AllFlowsPrecondition {
	public messageRun(message: Message) {
		return message.thread?.type === ChannelType.GuildNewsThread
			? this.ok()
			: this.error({
					identifier: Identifiers.PreconditionGuildNewsThreadOnly,
					message: 'You can only run this message command in server announcement thread channels.'
			  });
	}

	public async chatInputRun(interaction: CommandInteraction) {
		const channel = await this.fetchChannelFromInteraction(interaction);

		return channel.type === ChannelType.GuildNewsThread
			? this.ok()
			: this.error({
					identifier: Identifiers.PreconditionGuildNewsThreadOnly,
					message: 'You can only run this chat input command in server announcement thread channels.'
			  });
	}

	public async contextMenuRun(interaction: ContextMenuCommandInteraction) {
		const channel = await this.fetchChannelFromInteraction(interaction);

		return channel.type === ChannelType.GuildNewsThread
			? this.ok()
			: this.error({
					identifier: Identifiers.PreconditionGuildNewsThreadOnly,
					message: 'You can only run this context menu command in server announcement thread channels.'
			  });
	}
}
