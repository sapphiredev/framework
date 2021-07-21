import type { PieceContext } from '@sapphire/pieces';
import type { GuildChannel, ThreadChannel } from 'discord.js';
import type { ArgumentResult } from '../lib/structures/Argument';
import { ExtendedArgument, ExtendedArgumentContext } from '../lib/structures/ExtendedArgument';

export class CoreArgument extends ExtendedArgument<'guildChannel', ThreadChannel> {
	public constructor(context: PieceContext) {
		super(context, {
			name: 'guildThreadChannel',
			baseArgument: 'guildChannel'
		});
	}

	public handle(channel: GuildChannel, context: ExtendedArgumentContext): ArgumentResult<ThreadChannel> {
		return channel.isThread()
			? this.ok(channel)
			: this.error({
					parameter: context.parameter,
					message: 'The argument did not resolve to a server thread channel.',
					context: { ...context, channel }
			  });
	}
}
