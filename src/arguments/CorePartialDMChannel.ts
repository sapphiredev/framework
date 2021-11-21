import type { PieceContext } from '@sapphire/pieces';
import type { DMChannel, PartialDMChannel } from 'discord.js';
import { resolvePartialDMChannel } from '../lib/resolvers';
import { Argument } from '../lib/structures/Argument';

export class CoreArgument extends Argument<DMChannel | PartialDMChannel> {
	public constructor(context: PieceContext) {
		super(context, { name: 'partialDMChannel' });
	}

	public run(parameter: string, context: Argument.Context): Argument.Result<DMChannel | PartialDMChannel> {
		const resolved = resolvePartialDMChannel(parameter, context.message);
		if (resolved.success) return this.ok(resolved.value);
		return this.error({
			parameter,
			identifier: resolved.error,
			message: 'The argument did not resolve to a Partial DM channel.',
			context
		});
	}
}
