import type { PieceContext } from '@sapphire/pieces';
import type { PartialDMChannel } from 'discord.js';
import { resolvePartialDMChannel } from '../lib/resolvers';
import { Argument, ArgumentContext, ArgumentResult } from '../lib/structures/Argument';

export class CoreArgument extends Argument<PartialDMChannel> {
	public constructor(context: PieceContext) {
		super(context, { name: 'partialDmChannel' });
	}

	public run(parameter: string, context: ArgumentContext): ArgumentResult<PartialDMChannel> {
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
