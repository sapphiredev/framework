import type { CommandInteraction, ContextMenuInteraction, Message } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { AllFlowsPrecondition } from '../lib/structures/Precondition';

export class GuildPublicThreadOnlyPrecondition extends AllFlowsPrecondition {
	public messageRun(message: Message) {
		return message.thread?.type === 'GUILD_PUBLIC_THREAD'
			? this.ok()
			: this.error({
					identifier: Identifiers.PreconditionGuildPublicThreadOnly,
					message: 'You can only run this message command in public server thread channels.'
			  });
	}

	public async chatInputRun(interaction: CommandInteraction) {
		const channel = await this.fetchChannelFromInteraction(interaction);

		return channel.type === 'GUILD_PUBLIC_THREAD'
			? this.ok()
			: this.error({
					identifier: Identifiers.PreconditionGuildPublicThreadOnly,
					message: 'You can only run this chat input command in public server thread channels.'
			  });
	}

	public async contextMenuRun(interaction: ContextMenuInteraction) {
		const channel = await this.fetchChannelFromInteraction(interaction);

		return channel.type === 'GUILD_PUBLIC_THREAD'
			? this.ok()
			: this.error({
					identifier: Identifiers.PreconditionGuildPublicThreadOnly,
					message: 'You can only run this context menu command in public server thread channels.'
			  });
	}
}
