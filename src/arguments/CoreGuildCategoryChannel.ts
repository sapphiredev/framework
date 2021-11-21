import type { PieceContext } from '@sapphire/pieces';
import type { CategoryChannel } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { resolveGuildCategoryChannel } from '../lib/resolvers';
import { Argument } from '../lib/structures/Argument';

export class CoreArgument extends Argument<CategoryChannel> {
	public constructor(context: PieceContext) {
		super(context, { name: 'guildCategoryChannel' });
	}

	public run(parameter: string, context: Argument.Context): Argument.Result<CategoryChannel> {
		const { guild } = context.message;
		if (!guild) {
			return this.error({
				parameter,
				identifier: Identifiers.ArgumentGuildChannelMissingGuildError,
				message: 'This command can only be used in a server.',
				context
			});
		}

		const resolved = resolveGuildCategoryChannel(parameter, guild);
		if (resolved.success) return this.ok(resolved.value);
		return this.error({
			parameter,
			identifier: resolved.error,
			message: 'The argument did not resolve to a valid server category channel.',
			context: { ...context, guild }
		});
	}
}
