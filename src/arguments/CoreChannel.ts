import { container, PieceContext } from '@sapphire/pieces';
import type { Channel } from 'discord.js';
import { Argument, ArgumentContext, ArgumentResult } from '../lib/structures/Argument';
import { err, ok, Result } from '../lib/parsers/Result';

export class CoreArgument extends Argument<Channel> {
	public constructor(context: PieceContext) {
		super(context, { name: 'channel' });
	}

	public run(parameter: string, context: ArgumentContext): ArgumentResult<Channel> {
		const resolved = CoreArgument.resolve(parameter);
		if (resolved.success) return this.ok(resolved.value);
		return this.error({
			parameter,
			message: resolved.error,
			context
		});
	}

	public static resolve(parameter: string): Result<Channel, string> {
		const channel = container.client.channels.cache.get(parameter);
		if (channel) return ok(channel);
		return err('The argument did not resolve to a channel.');
	}
}
