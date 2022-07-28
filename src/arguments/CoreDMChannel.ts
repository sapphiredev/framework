import type { PieceContext } from '@sapphire/pieces';
import type { DMChannel } from 'discord.js';
import { resolveDMChannel } from '../lib/resolvers';
import { Argument } from '../lib/structures/Argument';

export class CoreArgument extends Argument<DMChannel> {
	public constructor(context: PieceContext) {
		super(context, { name: 'dmChannel' });
	}

	public run(parameter: string, context: Argument.Context): Argument.Result<DMChannel> {
		const resolved = resolveDMChannel(parameter, context.message);
		return resolved.mapErr((identifier) =>
			this.errorContext({
				parameter,
				identifier,
				message: 'The argument did not resolve to a DM channel.',
				context
			})
		);
	}
}
