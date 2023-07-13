import type { PieceContext } from '@sapphire/pieces';
import type { Message } from 'discord.js';
import { resolveMessage } from '../lib/resolvers/message';
import { Argument } from '../lib/structures/Argument';
import type { MessageArgumentContext } from '../lib/types/ArgumentContexts';

export class CoreArgument extends Argument<Message> {
	public constructor(context: PieceContext) {
		super(context, { name: 'message' });
	}

	public override async messageRun(parameter: string, context: MessageArgumentContext): Argument.AsyncResult<Message> {
		const channel = context.channel ?? context.message.channel;
		const resolved = await resolveMessage(parameter, {
			messageOrInteraction: context.message,
			channel: context.channel,
			scan: context.scan ?? false
		});

		return resolved.mapErrInto((identifier) =>
			this.error({
				parameter,
				identifier,
				message: 'The given argument did not resolve to a message.',
				context: { ...context, channel }
			})
		);
	}

	public override async chatInputRun(
		name: string,
		context: Pick<MessageArgumentContext, 'channel' | 'scan'> & Argument.ChatInputContext
	): Argument.AsyncResult<Message> {
		const channel = context.channel ?? context.interaction.channel;
		const resolved = await resolveMessage(context.interaction.options.getString(name) ?? '', {
			messageOrInteraction: context.interaction,
			channel: context.channel,
			scan: context.scan ?? false
		});

		return resolved.mapErrInto((identifier) =>
			this.error({
				parameter: name,
				identifier,
				message: 'The given argument did not resolve to a message.',
				context: { ...context, channel }
			})
		);
	}
}
