import type { PieceContext } from '@sapphire/pieces';
import type { CategoryChannel } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { resolveGuildCategoryChannel } from '../lib/resolvers/guildCategoryChannel';
import { Argument } from '../lib/structures/Argument';

export class CoreArgument extends Argument<CategoryChannel> {
	public constructor(context: PieceContext) {
		super(context, { name: 'guildCategoryChannel' });
	}

	public override messageRun(parameter: string, context: Argument.MessageContext): Argument.Result<CategoryChannel> {
		const { guild } = context.message;
		if (!guild) return this.guildError(parameter, context);

		const resolved = resolveGuildCategoryChannel(parameter, guild);
		return resolved.mapErrInto((identifier) =>
			this.error({
				parameter,
				identifier,
				message: 'The argument did not resolve to a valid server category channel.',
				context: { ...context, guild }
			})
		);
	}

	public override chatInputRun(name: string, context: Argument.ChatInputContext): Argument.Result<CategoryChannel> {
		const { guild } = context.interaction;
		if (!guild) return this.guildError(name, context);

		const resolved = context.useStringResolver
			? resolveGuildCategoryChannel(context.interaction.options.getString(name) ?? '', guild)
			: resolveGuildCategoryChannel(context.interaction.options.getChannel(name)?.id ?? '', guild);
		return resolved.mapErrInto((identifier) =>
			this.error({
				parameter: name,
				identifier,
				message: 'The argument did not resolve to a valid server category channel.',
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
