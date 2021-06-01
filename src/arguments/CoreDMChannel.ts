import { isDMChannel } from '@sapphire/discord.js-utilities';
import type { PieceContext } from '@sapphire/pieces';
import type { Channel, DMChannel } from 'discord.js';
import type { ArgumentResult } from '../lib/structures/Argument';
import { ExtendedArgument, ExtendedArgumentContext } from '../lib/structures/ExtendedArgument';
import { err, ok, Result } from '../lib/parsers/Result';

export class CoreArgument extends ExtendedArgument<'channel', DMChannel> {
	public constructor(context: PieceContext) {
		super(context, { baseArgument: 'channel', name: 'dmChannel' });
	}

	public handle(channel: Channel, context: ExtendedArgumentContext): ArgumentResult<DMChannel> {
		const resolved = CoreArgument.resolve(channel);
		if (resolved.success) return this.ok(resolved.value);
		return this.error({
			parameter: context.parameter,
			message: resolved.error,
			context: { ...context, channel }
		});
	}

	public static resolve(channel: Channel): Result<DMChannel, string> {
		if (isDMChannel(channel)) return ok(channel);
		return err('The argument did not resolve to a DM channel.');
	}
}
