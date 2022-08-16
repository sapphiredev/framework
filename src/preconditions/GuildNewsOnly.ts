import type { CommandInteraction, ContextMenuInteraction, Message, TextBasedChannelTypes } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { AllFlowsPrecondition } from '../lib/structures/Precondition';

export class CorePrecondition extends AllFlowsPrecondition {
	private readonly allowedTypes: TextBasedChannelTypes[] = ['GUILD_NEWS', 'GUILD_NEWS_THREAD'];

	public messageRun(message: Message): AllFlowsPrecondition.Result {
		return this.allowedTypes.includes(message.channel.type)
			? this.ok()
			: this.error({
					identifier: Identifiers.PreconditionGuildNewsOnly,
					message: 'You can only run this message command in server announcement channels.'
			  });
	}

	public async chatInputRun(interaction: CommandInteraction): AllFlowsPrecondition.AsyncResult {
		const channel = await this.fetchChannelFromInteraction(interaction);

		return this.allowedTypes.includes(channel.type)
			? this.ok()
			: this.error({
					identifier: Identifiers.PreconditionGuildNewsOnly,
					message: 'You can only run this chat input command in server announcement channels.'
			  });
	}

	public async contextMenuRun(interaction: ContextMenuInteraction): AllFlowsPrecondition.AsyncResult {
		const channel = await this.fetchChannelFromInteraction(interaction);

		return this.allowedTypes.includes(channel.type)
			? this.ok()
			: this.error({
					identifier: Identifiers.PreconditionGuildNewsOnly,
					message: 'You can only run this context menu command in server announcement channels.'
			  });
	}
}
