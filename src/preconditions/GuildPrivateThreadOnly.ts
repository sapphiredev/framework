import type { CommandInteraction, ContextMenuInteraction, Message } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { AllFlowsPrecondition } from '../lib/structures/Precondition';

export class CorePrecondition extends AllFlowsPrecondition {
	public messageRun(message: Message): AllFlowsPrecondition.Result {
		return message.thread?.type === 'GUILD_PRIVATE_THREAD'
			? this.ok()
			: this.error({
					identifier: Identifiers.PreconditionGuildPrivateThreadOnly,
					message: 'You can only run this message command in private server thread channels.'
			  });
	}

	public async chatInputRun(interaction: CommandInteraction): AllFlowsPrecondition.AsyncResult {
		const channel = await this.fetchChannelFromInteraction(interaction);

		return channel.type === 'GUILD_PRIVATE_THREAD'
			? this.ok()
			: this.error({
					identifier: Identifiers.PreconditionGuildPrivateThreadOnly,
					message: 'You can only run this chat input command in private server thread channels.'
			  });
	}

	public async contextMenuRun(interaction: ContextMenuInteraction): AllFlowsPrecondition.AsyncResult {
		const channel = await this.fetchChannelFromInteraction(interaction);

		return channel.type === 'GUILD_PRIVATE_THREAD'
			? this.ok()
			: this.error({
					identifier: Identifiers.PreconditionGuildPrivateThreadOnly,
					message: 'You can only run this context menu command in private server thread channels.'
			  });
	}
}
