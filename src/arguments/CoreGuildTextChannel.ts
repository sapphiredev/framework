import type { PieceContext } from '@sapphire/pieces';
import type { TextChannel } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { resolveGuildTextChannel } from '../lib/resolvers';
import { Argument } from '../lib/structures/Argument';

export class CoreArgument extends Argument<TextChannel> {
	public constructor(context: PieceContext) {
		super(context, { name: 'guildTextChannel' });
	}

	public run(parameter: string, context: Argument.Context): Argument.Result<TextChannel> {
		const { guild } = context.message;
		if (!guild) {
			return this.error({
				parameter,
				identifier: Identifiers.ArgumentGuildChannelMissingGuildError,
				message: 'This command can only be used in a server.',
				context
			});
		}

		const resolved = resolveGuildTextChannel(parameter, guild);
		return resolved.mapErr((identifier) =>
			this.errorContext({
				parameter,
				identifier,
				message: 'The given argument did not resolve to a valid text channel.',
				context: { ...context, guild }
			})
		);
	}
}
