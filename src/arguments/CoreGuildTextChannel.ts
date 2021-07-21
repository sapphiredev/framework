import { isTextChannel } from '@sapphire/discord.js-utilities';
import type { PieceContext } from '@sapphire/pieces';
import type { GuildChannel, TextChannel } from 'discord.js';
import type { ArgumentResult } from '../lib/structures/Argument';
import { ExtendedArgument, ExtendedArgumentContext } from '../lib/structures/ExtendedArgument';

export class CoreArgument extends ExtendedArgument<'guildChannel', TextChannel> {
	public constructor(context: PieceContext) {
		super(context, {
			name: 'guildTextChannel',
			baseArgument: 'guildChannel'
		});
	}

	public handle(channel: GuildChannel, context: ExtendedArgumentContext): ArgumentResult<TextChannel> {
		return isTextChannel(channel)
			? this.ok(channel)
			: this.error({
					parameter: context.parameter,
					message: 'The argument did not resolve to a server text channel.',
					context: { ...context, channel }
			  });
	}
}
