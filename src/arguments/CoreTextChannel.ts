import type { PieceContext } from '@sapphire/pieces';
import type { TextChannel } from 'discord.js';
import { Argument, ArgumentContext, ArgumentResult } from '../lib/structures/Argument';

export class CoreArgument extends Argument<TextChannel> {
	public constructor(context: PieceContext) {
		super(context, { name: 'textChannel' });
	}

	public run(argument: string, context: ArgumentContext): ArgumentResult<TextChannel> {
		const channel = (context.message.guild ? context.message.guild.channels : this.client.channels).cache.get(argument);

		if (!channel) {
			return this.error(argument, 'ArgumentChannelMissingChannel', 'The argument did not resolve to a channel.');
		}
		if (channel.type !== 'text') {
			return this.error(argument, 'ArgumentChannelInvalidChannel', 'The argument did not resolve to a text channel.');
		}

		return this.ok(channel as TextChannel);
	}
}
