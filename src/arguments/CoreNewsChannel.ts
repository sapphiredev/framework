import type { PieceContext } from '@sapphire/pieces';
import type { NewsChannel } from 'discord.js';
import { Argument, ArgumentContext, ArgumentResult } from '../lib/structures/Argument';

export class CoreArgument extends Argument<NewsChannel> {
	public constructor(context: PieceContext) {
		super(context, { name: 'newsChannel' });
	}

	public run(argument: string, context: ArgumentContext): ArgumentResult<NewsChannel> {
		const channel = (context.message.guild ? context.message.guild.channels : this.client.channels).cache.get(argument);

		if (!channel) {
			return this.error(argument, 'ArgumentChannelMissingChannel', 'The argument did not resolve to a channel.');
		}
		if (channel.type !== 'news') {
			return this.error(argument, 'ArgumentNewsChannelInvalidChannel', 'The argument did not resolve to a news channel.');
		}

		return this.ok(channel as NewsChannel);
	}
}
