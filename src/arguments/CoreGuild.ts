import { container } from '@sapphire/pieces';
import type { Guild } from 'discord.js';
import { resolveGuild } from '../lib/resolvers/guild';
import { Argument } from '../lib/structures/Argument';

export class CoreArgument extends Argument<Guild> {
	public constructor(context: Argument.LoaderContext) {
		super(context, { name: 'guild' });
	}

	public async run(parameter: string, context: Argument.Context): Argument.AsyncResult<Guild> {
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
}

void container.stores.loadPiece({
	name: 'guild',
	piece: CoreArgument,
	store: 'arguments'
});
