import type { PieceContext } from '@sapphire/pieces';
import type { Channel, Snowflake } from 'discord.js';
import { Argument, ArgumentContext, ArgumentResult } from '../lib/structures/Argument';

export class CoreArgument extends Argument<Channel> {
	public constructor(context: PieceContext) {
		super(context, { name: 'channel' });
	}

	public run(parameter: string, context: ArgumentContext): ArgumentResult<Channel> {
		const channel = (context.message.guild ? context.message.guild.channels : this.container.client.channels).cache.get(parameter as Snowflake);
		return channel
			? this.ok(channel)
			: this.error({
					parameter,
					message: 'The argument did not resolve to a channel.',
					context: { ...context, channel }
			  });
	}
}
