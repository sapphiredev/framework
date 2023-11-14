import { container } from '@sapphire/pieces';
import type { ChatInputCommandInteraction, ContextMenuCommandInteraction, Message } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { Command } from '../lib/structures/Command';
import { AllFlowsPrecondition, type Preconditions } from '../lib/structures/Precondition';
import type { ChatInputCommand, ContextMenuCommand, MessageCommand } from '../lib/types/CommandTypes';

export interface RunInPreconditionContext extends AllFlowsPrecondition.Context {
	types?: Preconditions['RunIn']['types'];
}

export class CorePrecondition extends AllFlowsPrecondition {
	public override messageRun(message: Message<boolean>, _: MessageCommand, context: RunInPreconditionContext): AllFlowsPrecondition.Result {
		if (!context.types) return this.ok();

		const channelType = message.channel.type;

		if (Command.runInTypeIsSpecificsObject(context.types)) {
			return context.types.messageRun.includes(channelType) ? this.ok() : this.makeSharedError(context);
		}

		return context.types.includes(channelType) ? this.ok() : this.makeSharedError(context);
	}

	public override async chatInputRun(
		interaction: ChatInputCommandInteraction,
		_: ChatInputCommand,
		context: RunInPreconditionContext
	): AllFlowsPrecondition.AsyncResult {
		if (!context.types) return this.ok();

		const channelType = (await this.fetchChannelFromInteraction(interaction)).type;

		if (Command.runInTypeIsSpecificsObject(context.types)) {
			return context.types.chatInputRun.includes(channelType) ? this.ok() : this.makeSharedError(context);
		}

		return context.types.includes(channelType) ? this.ok() : this.makeSharedError(context);
	}

	public override async contextMenuRun(
		interaction: ContextMenuCommandInteraction,
		_: ContextMenuCommand,
		context: RunInPreconditionContext
	): AllFlowsPrecondition.AsyncResult {
		if (!context.types) return this.ok();

		const channelType = (await this.fetchChannelFromInteraction(interaction)).type;

		if (Command.runInTypeIsSpecificsObject(context.types)) {
			return context.types.contextMenuRun.includes(channelType) ? this.ok() : this.makeSharedError(context);
		}

		return context.types.includes(channelType) ? this.ok() : this.makeSharedError(context);
	}

	private makeSharedError(context: RunInPreconditionContext): AllFlowsPrecondition.Result {
		return this.error({
			identifier: Identifiers.PreconditionRunIn,
			message: 'You cannot run this message command in this type of channel.',
			context: { types: context.types }
		});
	}
}

void container.stores.loadPiece({
	name: 'RunIn',
	piece: CorePrecondition,
	store: 'preconditions'
});
