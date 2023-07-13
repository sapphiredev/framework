import type { GuildBasedChannelTypes } from '@sapphire/discord.js-utilities';
import type { PieceContext } from '@sapphire/pieces';
import { Identifiers } from '../lib/errors/Identifiers';
import { resolveGuildChannel } from '../lib/resolvers/guildChannel';
import { Argument } from '../lib/structures/Argument';

export class CoreArgument extends Argument<GuildBasedChannelTypes> {
	public constructor(context: PieceContext) {
		super(context, { name: 'guildChannel' });
	}

	public override messageRun(parameter: string, context: Argument.MessageContext): Argument.Result<GuildBasedChannelTypes> {
		const { guild } = context.message;
		if (!guild) return this.guildError(parameter, context);

		const resolved = resolveGuildChannel(parameter, guild);
		return resolved.mapErrInto((identifier) =>
			this.error({
				parameter,
				identifier,
				message: 'The argument did not resolve to a valid server channel.',
				context: { ...context, guild }
			})
		);
	}

	public override chatInputRun(name: string, context: Argument.ChatInputContext): Argument.Result<GuildBasedChannelTypes> {
		const { guild } = context.interaction;
		if (!guild) return this.guildError(name, context);

		const resolved = context.useStringResolver
			? resolveGuildChannel(context.interaction.options.getString(name) ?? '', guild)
			: resolveGuildChannel(context.interaction.options.getChannel(name)?.id ?? '', guild);
		return resolved.mapErrInto((identifier) =>
			this.error({
				parameter: name,
				identifier,
				message: 'The argument did not resolve to a valid server channel.',
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
