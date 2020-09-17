import type { PieceContext } from '@sapphire/pieces';
import type { VoiceChannel } from 'discord.js';
import { Argument, ArgumentContext, ArgumentResult } from '../lib/structures/Argument';

export class CoreArgument extends Argument<VoiceChannel> {
	public constructor(context: PieceContext) {
		super(context, { name: 'voiceChannel' });
	}

	public run(argument: string, context: ArgumentContext): ArgumentResult<VoiceChannel> {
		const channel = (context.message.guild ? context.message.guild.channels : this.client.channels).cache.get(argument);

		if (!channel) {
			return this.error(argument, 'ArgumentChannelMissingChannel', 'The argument did not resolve to a channel.');
		}
		if (channel.type !== 'voice') {
			return this.error(argument, 'ArgumentVoiceChannelInvalidChannel', 'The argument did not resolve to a voice channel.');
		}

		return this.ok(channel as VoiceChannel);
	}
}
