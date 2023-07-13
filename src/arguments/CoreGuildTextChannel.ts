import type { PieceContext } from '@sapphire/pieces';
import type { TextChannel } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { resolveGuildTextChannel } from '../lib/resolvers/guildTextChannel';
import { Argument } from '../lib/structures/Argument';

export class CoreArgument extends Argument<TextChannel> {
	public constructor(context: PieceContext) {
		super(context, { name: 'guildTextChannel' });
	}

	public override messageRun(parameter: string, context: Argument.MessageContext): Argument.Result<TextChannel> {
		const { guild } = context.message;
		if (!guild) return this.guildError(parameter, context);

		const resolved = resolveGuildTextChannel(parameter, guild);
		return resolved.mapErrInto((identifier) =>
			this.error({
				parameter,
				identifier,
				message: 'The given argument did not resolve to a valid text channel.',
				context: { ...context, guild }
			})
		);
	}

	public override chatInputRun(name: string, context: Argument.ChatInputContext): Argument.Result<TextChannel> {
		const { guild } = context.interaction;
		if (!guild) return this.guildError(name, context);

		const resolved = context.useStringResolver
			? resolveGuildTextChannel(context.interaction.options.getString(name) ?? '', guild)
			: resolveGuildTextChannel(context.interaction.options.getChannel(name)?.id ?? '', guild);
		return resolved.mapErrInto((identifier) =>
			this.error({
				parameter: name,
				identifier,
				message: 'The given argument did not resolve to a valid text channel.',
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
