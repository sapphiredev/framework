import { container } from '@sapphire/pieces';
import { ChannelType, ChatInputCommandInteraction, ContextMenuCommandInteraction, Message, type TextBasedChannelTypes } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { AllFlowsPrecondition } from '../lib/structures/Precondition';

export class CorePrecondition extends AllFlowsPrecondition {
	private readonly allowedTypes: TextBasedChannelTypes[] = [ChannelType.GuildText, ChannelType.PublicThread, ChannelType.PrivateThread];

	public messageRun(message: Message): AllFlowsPrecondition.Result {
		return this.allowedTypes.includes(message.channel.type) ? this.ok() : this.makeSharedError();
	}

	public async chatInputRun(interaction: ChatInputCommandInteraction): AllFlowsPrecondition.AsyncResult {
		const channel = await this.fetchChannelFromInteraction(interaction);
		return this.allowedTypes.includes(channel.type) ? this.ok() : this.makeSharedError();
	}

	public async contextMenuRun(interaction: ContextMenuCommandInteraction): AllFlowsPrecondition.AsyncResult {
		const channel = await this.fetchChannelFromInteraction(interaction);
		return this.allowedTypes.includes(channel.type) ? this.ok() : this.makeSharedError();
	}

	private makeSharedError(): AllFlowsPrecondition.Result {
		return this.error({
			identifier: Identifiers.PreconditionGuildTextOnly,
			message: 'You can only run this command in server text channels.'
		});
	}
}

void container.stores.loadPiece({
	name: 'GuildTextOnly',
	piece: CorePrecondition,
	store: 'preconditions'
});
