import type { PieceContext } from '@sapphire/pieces';
import type { GuildChannel, TextChannel } from 'discord.js';
import type { ArgumentResult } from '../lib/structures/Argument';
import { ExtendedArgument, ExtendedArgumentContext } from '../lib/structures/ExtendedArgument';

export class CoreArgument extends ExtendedArgument<'guildChannel', TextChannel> {
	public constructor(context: PieceContext) {
		super(context, {
			name: 'textChannel',
			baseArgument: 'guildChannel'
		});
	}

	public handle(channel: GuildChannel, { argument }: ExtendedArgumentContext): ArgumentResult<TextChannel> {
		return channel.type === 'text'
			? this.ok(channel as TextChannel)
			: this.error(argument, 'ArgumentTextChannelInvalidChannel', 'The argument did not resolve to a text channel.');
	}
}
