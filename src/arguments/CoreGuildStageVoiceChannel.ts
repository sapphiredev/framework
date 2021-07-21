import type { PieceContext } from '@sapphire/pieces';
import type { GuildChannel, StageChannel } from 'discord.js';
import type { ArgumentResult } from '../lib/structures/Argument';
import { ExtendedArgument, ExtendedArgumentContext } from '../lib/structures/ExtendedArgument';

export class CoreArgument extends ExtendedArgument<'guildChannel', StageChannel> {
	public constructor(context: PieceContext) {
		super(context, {
			name: 'guildStageVoiceChannel',
			baseArgument: 'guildChannel'
		});
	}

	public handle(channel: GuildChannel, context: ExtendedArgumentContext): ArgumentResult<StageChannel> {
		return channel.type === 'GUILD_STAGE_VOICE'
			? this.ok(channel as StageChannel)
			: this.error({
					parameter: context.parameter,
					message: 'The argument did not resolve to a server stage voice channel.',
					context: { ...context, channel }
			  });
	}
}
