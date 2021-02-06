import { isCategoryChannel } from '@sapphire/discord.js-utilities';
import type { PieceContext } from '@sapphire/pieces';
import type { CategoryChannel, GuildChannel } from 'discord.js';
import type { ArgumentResult } from '../lib/structures/Argument';
import { ExtendedArgument, ExtendedArgumentContext } from '../lib/structures/ExtendedArgument';

export class CoreArgument extends ExtendedArgument<'guildChannel', CategoryChannel> {
	public constructor(context: PieceContext) {
		super(context, {
			name: 'categoryChannel',
			baseArgument: 'guildChannel'
		});
	}

	public handle(channel: GuildChannel, context: ExtendedArgumentContext): ArgumentResult<CategoryChannel> {
		return isCategoryChannel(channel)
			? this.ok(channel)
			: this.error({ parameter: context.parameter, message: 'The argument did not resolve to a category channel.', context });
	}
}
