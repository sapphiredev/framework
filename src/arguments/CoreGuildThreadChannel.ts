import type { PieceContext } from '@sapphire/pieces';
import type { ThreadChannel } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { resolveGuildThreadChannel } from '../lib/resolvers/guildThreadChannel';
import { Argument } from '../lib/structures/Argument';

export class CoreArgument extends Argument<ThreadChannel> {
	public constructor(context: PieceContext) {
		super(context, { name: 'guildThreadChannel' });
	}

	public override messageRun(parameter: string, context: Argument.MessageContext): Argument.Result<ThreadChannel> {
		const { guild } = context.message;
		if (!guild) return this.guildError(parameter, context);

		const resolved = resolveGuildThreadChannel(parameter, guild);
		return resolved.mapErrInto((identifier) =>
			this.error({
				parameter,
				identifier,
				message: 'The given argument did not resolve to a valid thread.',
				context: { ...context, guild }
			})
		);
	}

	public override chatInputRun(name: string, context: Argument.ChatInputContext): Argument.Result<ThreadChannel> {
		const { guild } = context.interaction;
		if (!guild) return this.guildError(name, context);

		const resolved = context.useStringResolver
			? resolveGuildThreadChannel(context.interaction.options.getString(name) ?? '', guild)
			: resolveGuildThreadChannel(context.interaction.options.getChannel(name)?.id ?? '', guild);
		return resolved.mapErrInto((identifier) =>
			this.error({
				parameter: name,
				identifier,
				message: 'The given argument did not resolve to a valid thread.',
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
