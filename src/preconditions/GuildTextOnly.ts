import { ChannelType, CommandInteraction, ContextMenuCommandInteraction, Message, TextBasedChannelTypes } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { AllFlowsPrecondition } from '../lib/structures/Precondition';

export class CorePrecondition extends AllFlowsPrecondition {
	private readonly allowedTypes: TextBasedChannelTypes[] = [ChannelType.GuildText, ChannelType.GuildPublicThread, ChannelType.GuildPrivateThread];

	public messageRun(message: Message) {
		return this.allowedTypes.includes(message.channel.type)
			? this.ok()
			: this.error({
					identifier: Identifiers.PreconditionGuildTextOnly,
					message: 'You can only run this message command in server text channels.'
			  });
	}

	public async chatInputRun(interaction: CommandInteraction) {
		const channel = await this.fetchChannelFromInteraction(interaction);

		return this.allowedTypes.includes(channel.type)
			? this.ok()
			: this.error({
					identifier: Identifiers.PreconditionGuildTextOnly,
					message: 'You can only run this chat input command in server text channels.'
			  });
	}

	public async contextMenuRun(interaction: ContextMenuCommandInteraction) {
		const channel = await this.fetchChannelFromInteraction(interaction);

		return this.allowedTypes.includes(channel.type)
			? this.ok()
			: this.error({
					identifier: Identifiers.PreconditionGuildTextOnly,
					message: 'You can only run this context menu command in server text channels.'
			  });
	}
}
