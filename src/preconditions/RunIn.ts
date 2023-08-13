import type { ChannelType, ChatInputCommandInteraction, ContextMenuCommandInteraction, Message } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import type { ChatInputCommand, ContextMenuCommand, MessageCommand } from '../lib/structures/Command';
import { AllFlowsPrecondition } from '../lib/structures/Precondition';

export interface RunInPreconditionContext extends AllFlowsPrecondition.Context {
	types?: readonly ChannelType[];
}

export class CorePrecondition extends AllFlowsPrecondition {
	public override messageRun(message: Message<boolean>, _: MessageCommand, context: RunInPreconditionContext): AllFlowsPrecondition.Result {
		return context.types && context.types.includes(message.channel.type) //
			? this.ok()
			: this.makeSharedError(context);
	}

	public override async chatInputRun(
		interaction: ChatInputCommandInteraction,
		_: ChatInputCommand,
		context: RunInPreconditionContext
	): AllFlowsPrecondition.AsyncResult {
		return context.types && context.types.includes((await this.fetchChannelFromInteraction(interaction)).type)
			? this.ok()
			: this.makeSharedError(context);
	}

	public override async contextMenuRun(
		interaction: ContextMenuCommandInteraction,
		_: ContextMenuCommand,
		context: RunInPreconditionContext
	): AllFlowsPrecondition.AsyncResult {
		return context.types && context.types.includes((await this.fetchChannelFromInteraction(interaction)).type)
			? this.ok()
			: this.makeSharedError(context);
	}

	private makeSharedError(context: RunInPreconditionContext): AllFlowsPrecondition.Result {
		return this.error({
			identifier: Identifiers.PreconditionRunIn,
			message: 'You cannot run this message command in this type of channel.',
			context: { types: context.types }
		});
	}
}
