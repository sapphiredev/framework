import type { GuildBasedChannelTypes } from '@sapphire/discord.js-utilities';
import type { PieceContext } from '@sapphire/pieces';
import { Identifiers } from '../lib/errors/Identifiers';
import { resolveGuildChannel } from '../lib/resolvers';
import { Argument } from '../lib/structures/Argument';

export class CoreArgument extends Argument<GuildBasedChannelTypes> {
	public constructor(context: PieceContext) {
		super(context, { name: 'guildChannel' });
	}

	public run(parameter: string, context: Argument.Context): Argument.Result<GuildBasedChannelTypes> {
		const { guild } = context.message;
		if (!guild) {
			return this.error({
				parameter,
				identifier: Identifiers.ArgumentGuildChannelMissingGuildError,
				message: 'This command can only be used in a server.',
				context
			});
		}

		const resolved = resolveGuildChannel(parameter, guild);
		if (resolved.isOk()) return this.ok(resolved.unwrap());
		return this.error({
			parameter,
			identifier: resolved.unwrapErr(),
			message: 'The argument did not resolve to a valid server channel.',
			context: { ...context, guild }
		});
	}
}
