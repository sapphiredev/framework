import type { PieceContext } from '@sapphire/pieces';
import type { VoiceChannel } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { resolveGuildVoiceChannel } from '../lib/resolvers/guildVoiceChannel';
import { Argument } from '../lib/structures/Argument';

export class CoreArgument extends Argument<VoiceChannel> {
	public constructor(context: PieceContext) {
		super(context, { name: 'guildVoiceChannel' });
	}

	public override messageRun(parameter: string, context: Argument.MessageContext): Argument.Result<VoiceChannel> {
		const { guild } = context.message;
		if (!guild) return this.guildError(parameter, context);

		const resolved = resolveGuildVoiceChannel(parameter, guild);
		return resolved.mapErrInto((identifier) =>
			this.error({
				parameter,
				identifier,
				message: 'The given argument did not resolve to a valid voice channel.',
				context: { ...context, guild }
			})
		);
	}

	public override chatInputRun(name: string, context: Argument.ChatInputContext): Argument.Result<VoiceChannel> {
		const { guild } = context.interaction;
		if (!guild) return this.guildError(name, context);

		const resolved = context.useStringResolver
			? resolveGuildVoiceChannel(context.interaction.options.getString(name) ?? '', guild)
			: resolveGuildVoiceChannel(context.interaction.options.getChannel(name)?.id ?? '', guild);
		return resolved.mapErrInto((identifier) =>
			this.error({
				parameter: name,
				identifier,
				message: 'The given argument did not resolve to a valid voice channel.',
				context: { ...context, guild }
			})
		);
	}

	private guildError(parameter: string, context: Argument.MessageContext | Argument.ChatInputContext) {
		return this.error({
			parameter,
			identifier: Identifiers.ArgumentGuildChannelMissingGuildError,
			message: 'This command can only be used in a server.',
			context
		});
	}
}
