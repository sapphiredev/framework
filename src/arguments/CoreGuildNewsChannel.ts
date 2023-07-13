import type { PieceContext } from '@sapphire/pieces';
import type { NewsChannel } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { resolveGuildNewsChannel } from '../lib/resolvers/guildNewsChannel';
import { Argument } from '../lib/structures/Argument';

export class CoreArgument extends Argument<NewsChannel> {
	public constructor(context: PieceContext) {
		super(context, { name: 'guildNewsChannel' });
	}

	public override messageRun(parameter: string, context: Argument.MessageContext): Argument.Result<NewsChannel> {
		const { guild } = context.message;
		if (!guild) return this.guildError(parameter, context);

		const resolved = resolveGuildNewsChannel(parameter, guild);
		return resolved.mapErrInto((identifier) =>
			this.error({
				parameter,
				identifier,
				message: 'The given argument did not resolve to a valid announcements channel.',
				context: { ...context, guild }
			})
		);
	}

	public override chatInputRun(name: string, context: Argument.ChatInputContext): Argument.Result<NewsChannel> {
		const { guild } = context.interaction;
		if (!guild) return this.guildError(name, context);

		const resolved = context.useStringResolver
			? resolveGuildNewsChannel(context.interaction.options.getString(name) ?? '', guild)
			: resolveGuildNewsChannel(context.interaction.options.getChannel(name)?.id ?? '', guild);
		return resolved.mapErrInto((identifier) =>
			this.error({
				parameter: name,
				identifier,
				message: 'The given argument did not resolve to a valid announcements channel.',
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
