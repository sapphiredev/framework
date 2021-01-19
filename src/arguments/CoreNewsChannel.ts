import { isNewsChannel } from '@sapphire/discord.js-utilities';
import type { PieceContext } from '@sapphire/pieces';
import type { GuildChannel, NewsChannel } from 'discord.js';
import type { ArgumentResult } from '../lib/structures/Argument';
import { ExtendedArgument, ExtendedArgumentContext } from '../lib/structures/ExtendedArgument';

export class CoreArgument extends ExtendedArgument<'guildChannel', NewsChannel> {
	public constructor(context: PieceContext) {
		super(context, {
			name: 'newsChannel',
			baseArgument: 'guildChannel'
		});
	}

	public handle(channel: GuildChannel, { argument }: ExtendedArgumentContext): ArgumentResult<NewsChannel> {
		return isNewsChannel(channel)
			? this.ok(channel)
			: this.error(argument, 'ArgumentNewsChannelInvalidChannel', 'The argument did not resolve to a news channel.');
	}
}
