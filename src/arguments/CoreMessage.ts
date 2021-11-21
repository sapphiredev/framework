import type { PieceContext } from '@sapphire/pieces';
import type { Message } from 'discord.js';
import { resolveMessage } from '../lib/resolvers';
import { Argument } from '../lib/structures/Argument';

export class CoreArgument extends Argument<Message> {
	public constructor(context: PieceContext) {
		super(context, { name: 'message' });
	}

	public async run(parameter: string, context: { channel?: Message['channel'] } & Argument.Context): Argument.AsyncResult<Message> {
		const channel = context.channel ?? context.message.channel;
		const resolved = await resolveMessage(parameter, { message: context.message, channel: context.channel });
		if (resolved.success) return this.ok(resolved.value);
		return this.error({
			parameter,
			identifier: resolved.error,
			message: 'The given argument did not resolve to a message.',
			context: { ...context, channel }
		});
	}
}
