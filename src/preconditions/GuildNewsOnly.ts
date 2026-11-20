import { container } from '@sapphire/pieces';
import {
	ChannelType,
	type ChatInputCommandInteraction,
	type ContextMenuCommandInteraction,
	type Message,
	type TextBasedChannelTypes
} from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { AllFlowsPrecondition } from '../lib/structures/Precondition';

export class CorePrecondition extends AllFlowsPrecondition {
	private readonly allowedTypes: TextBasedChannelTypes[] = [ChannelType.GuildAnnouncement, ChannelType.AnnouncementThread];

	public messageRun(message: Message): AllFlowsPrecondition.Result {
		return this.allowedTypes.includes(message.channel.type) ? this.ok() : this.makeSharedError();
	}

	public async chatInputRun(interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction): AllFlowsPrecondition.AsyncResult {
		const channel = await this.fetchChannelFromInteraction(interaction);

		return this.allowedTypes.includes(channel.type) ? this.ok() : this.makeSharedError();
	}

	public async contextMenuRun(interaction: ContextMenuCommandInteraction): AllFlowsPrecondition.AsyncResult {
		return this.chatInputRun(interaction);
	}

	private makeSharedError(): AllFlowsPrecondition.Result {
		return this.error({
			identifier: Identifiers.PreconditionRunIn,
			message: 'You can only run this command in server announcement channels.'
		});
	}
}

void container.stores.loadPiece({
	name: 'GuildNewsOnly',
	piece: CorePrecondition,
	store: 'preconditions'
});
