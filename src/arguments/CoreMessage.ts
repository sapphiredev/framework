import type { PieceContext } from '@sapphire/pieces';
import type { Message } from 'discord.js';
import { resolveMessage, type MessageResolverOptions } from '../lib/resolvers/message';
import { Argument } from '../lib/structures/Argument';

export class CoreArgument extends Argument<Message> {
	public constructor(context: PieceContext) {
		super(context, { name: 'message' });
	}

	public async run(
		parameter: string,
		context: Omit<MessageResolverOptions, 'messageOrInteraction'> & Argument.Context
	): Argument.AsyncResult<Message> {
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
}
