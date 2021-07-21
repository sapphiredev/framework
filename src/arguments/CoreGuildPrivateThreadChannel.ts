import type { PieceContext } from '@sapphire/pieces';
import type { ThreadChannel } from 'discord.js';
import type { ArgumentResult } from '../lib/structures/Argument';
import { ExtendedArgument, ExtendedArgumentContext } from '../lib/structures/ExtendedArgument';

export class CoreArgument extends ExtendedArgument<'guildThreadChannel', ThreadChannel> {
	public constructor(context: PieceContext) {
		super(context, {
			name: 'guildPrivateThreadChannel',
			baseArgument: 'guildThreadChannel'
		});
	}

	public handle(channel: ThreadChannel, context: ExtendedArgumentContext): ArgumentResult<ThreadChannel> {
		return channel.type === 'GUILD_PRIVATE_THREAD'
			? this.ok(channel)
			: this.error({
					parameter: context.parameter,
					message: 'The argument did not resolve to a private server thread channel.',
					context: { ...context, channel }
			  });
	}
}
