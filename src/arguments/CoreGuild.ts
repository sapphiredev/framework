import type { PieceContext } from '@sapphire/pieces';
import type { Guild } from 'discord.js';
import { resolveGuild } from '../lib/resolvers/guild';
import { Argument } from '../lib/structures/Argument';

export class CoreArgument extends Argument<Guild> {
	public constructor(context: PieceContext) {
		super(context, { name: 'guild' });
	}

	public override async messageRun(parameter: string, context: Argument.MessageContext): Argument.AsyncResult<Guild> {
		const resolved = await resolveGuild(parameter);
		return resolved.mapErrInto((identifier) =>
			this.error({
				parameter,
				identifier,
				message: 'The given argument did not resolve to a Discord guild.',
				context
			})
		);
	}

	public override async chatInputRun(name: string, context: Argument.ChatInputContext): Argument.AsyncResult<Guild> {
		const resolved = await resolveGuild(context.interaction.options.getString(name) ?? '');
		return resolved.mapErrInto((identifier) =>
			this.error({
				parameter: name,
				identifier,
				message: 'The given argument did not resolve to a Discord guild.',
				context
			})
		);
	}
}
