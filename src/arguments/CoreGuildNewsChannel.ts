import type { PieceContext } from '@sapphire/pieces';
import type { NewsChannel } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { resolveGuildNewsChannel } from '../lib/resolvers';
import { Argument } from '../lib/structures/Argument';

export class CoreArgument extends Argument<NewsChannel> {
	public constructor(context: PieceContext) {
		super(context, { name: 'guildNewsChannel' });
	}

	public run(parameter: string, context: Argument.Context): Argument.Result<NewsChannel> {
		const { guild } = context.message;
		if (!guild) {
			return this.error({
				parameter,
				identifier: Identifiers.ArgumentGuildChannelMissingGuildError,
				message: 'This command can only be used in a server.',
				context
			});
		}

		const resolved = resolveGuildNewsChannel(parameter, guild);
		if (resolved.isOk()) return this.ok(resolved.unwrap());
		return this.error({
			parameter,
			identifier: resolved.unwrapErr(),
			message: 'The given argument did not resolve to a valid announcements channel.',
			context: { ...context, guild }
		});
	}
}
