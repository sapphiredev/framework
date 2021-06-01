import { isVoiceChannel } from '@sapphire/discord.js-utilities';
import type { PieceContext } from '@sapphire/pieces';
import type { GuildChannel, VoiceChannel } from 'discord.js';
import type { ArgumentResult } from '../lib/structures/Argument';
import { ExtendedArgument, ExtendedArgumentContext } from '../lib/structures/ExtendedArgument';
import { err, ok, Result } from '../lib/parsers/Result';

export class CoreArgument extends ExtendedArgument<'guildChannel', VoiceChannel> {
	public constructor(context: PieceContext) {
		super(context, {
			name: 'voiceChannel',
			baseArgument: 'guildChannel'
		});
	}

	public handle(channel: GuildChannel, context: ExtendedArgumentContext): ArgumentResult<VoiceChannel> {
		const resolved = CoreArgument.resolve(channel);
		if (resolved.success) return this.ok(resolved.value);
		return this.error({
			parameter: context.parameter,
			message: resolved.error,
			context: { ...context, channel }
		});
	}

	public static resolve(channel: GuildChannel): Result<VoiceChannel, string> {
		if (isVoiceChannel(channel)) return ok(channel);
		return err('The argument did not resolve to a voice channel.');
	}
}
