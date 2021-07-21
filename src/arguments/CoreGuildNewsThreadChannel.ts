import type { PieceContext } from '@sapphire/pieces';
import type { ThreadChannel } from 'discord.js';
import type { ArgumentResult } from '../lib/structures/Argument';
import { ExtendedArgument, ExtendedArgumentContext } from '../lib/structures/ExtendedArgument';

export class CoreArgument extends ExtendedArgument<'guildThreadChannel', ThreadChannel> {
	public constructor(context: PieceContext) {
		super(context, {
			name: 'guildNewsThreadChannel',
			baseArgument: 'guildThreadChannel'
		});
	}

	public handle(channel: ThreadChannel, context: ExtendedArgumentContext): ArgumentResult<ThreadChannel> {
		return channel.type === 'GUILD_NEWS_THREAD'
			? this.ok(channel)
			: this.error({
					parameter: context.parameter,
					message: 'The argument did not resolve to a server announcement thread channel.',
					context: { ...context, channel }
			  });
	}
}
