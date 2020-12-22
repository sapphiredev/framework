import type { PieceContext } from '@sapphire/pieces';
import type { DMChannel } from 'discord.js';
import { Argument, ArgumentResult } from '../lib/structures/Argument';

export class CoreArgument extends Argument<DMChannel> {
	public constructor(context: PieceContext) {
		super(context, { name: 'dmChannel' });
	}

	public run(argument: string): ArgumentResult<DMChannel> {
		const channel = this.context.client.channels.cache.get(argument);

		if (!channel) {
			return this.error(argument, 'ArgumentChannelMissingChannel', 'The argument did not resolve to a channel.');
		}
		if (channel.type !== 'dm') {
			return this.error(argument, 'ArgumentDMChannelInvalidChannel', 'The argument did not resolve to a DM channel.');
		}

		return this.ok(channel as DMChannel);
	}
}
