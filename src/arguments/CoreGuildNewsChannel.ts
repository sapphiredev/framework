import { isNewsChannel } from '@sapphire/discord.js-utilities';
import type { PieceContext } from '@sapphire/pieces';
import type { GuildChannel, NewsChannel } from 'discord.js';
import type { ArgumentResult } from '../lib/structures/Argument';
import { ExtendedArgument, ExtendedArgumentContext } from '../lib/structures/ExtendedArgument';

export class CoreArgument extends ExtendedArgument<'guildChannel', NewsChannel> {
	public constructor(context: PieceContext) {
		super(context, {
			name: 'guildNewsChannel',
			baseArgument: 'guildChannel'
		});
	}

	public handle(channel: GuildChannel, context: ExtendedArgumentContext): ArgumentResult<NewsChannel> {
		return isNewsChannel(channel)
			? this.ok(channel)
			: this.error({
					parameter: context.parameter,
					message: 'The argument did not resolve to a server announcement channel.',
					context: { ...context, channel }
			  });
	}
}
