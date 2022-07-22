import type { PieceContext } from '@sapphire/pieces';
import type { StageChannel } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { resolveGuildStageVoiceChannel } from '../lib/resolvers';
import { Argument } from '../lib/structures/Argument';

export class CoreArgument extends Argument<StageChannel> {
	public constructor(context: PieceContext) {
		super(context, { name: 'guildStageVoiceChannel' });
	}

	public run(parameter: string, context: Argument.Context): Argument.Result<StageChannel> {
		const { guild } = context.message;
		if (!guild) {
			return this.error({
				parameter,
				identifier: Identifiers.ArgumentGuildChannelMissingGuildError,
				message: 'This command can only be used in a server.',
				context
			});
		}

		const resolved = resolveGuildStageVoiceChannel(parameter, guild);
		if (resolved.isOk()) return this.ok(resolved.unwrap());
		return this.error({
			parameter,
			identifier: resolved.unwrapErr(),
			message: 'The given argument did not resolve to a valid stage voice channel.',
			context: { ...context, guild }
		});
	}
}
