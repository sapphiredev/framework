import type { PieceContext } from '@sapphire/pieces';
import type { Channel, Guild } from 'discord.js';
import { Argument, ArgumentContext, ArgumentResult } from '../lib/structures/Argument';

export class CoreArgument extends Argument<Channel> {
	public constructor(context: PieceContext) {
		super(context, { name: 'channel' });
	}

	public run(argument: string, context: ArgumentContext): ArgumentResult<Channel> {
		const channel = (context.guild ? (context.guild as Guild).channels : this.client.channels).cache.get(argument);

		if (!channel) {
			return this.error(argument, 'ArgumentChannelMissingChannel', 'The argument did not resolve to a channel.');
		}

		return this.ok(channel);
	}
}
