import { isNewsChannel } from '@sapphire/discord.js-utilities';
import type { PieceContext } from '@sapphire/pieces';
import type { GuildChannel, NewsChannel } from 'discord.js';
import type { ArgumentResult } from '../lib/structures/Argument';
import { ExtendedArgument, ExtendedArgumentContext } from '../lib/structures/ExtendedArgument';
import { err, ok, Result } from '../lib/parsers/Result';

export class CoreArgument extends ExtendedArgument<'guildChannel', NewsChannel> {
	public constructor(context: PieceContext) {
		super(context, {
			name: 'newsChannel',
			baseArgument: 'guildChannel'
		});
	}

	public handle(channel: GuildChannel, context: ExtendedArgumentContext): ArgumentResult<NewsChannel> {
		const resolved = CoreArgument.resolve(channel);
		if (resolved.success) return this.ok(resolved.value);
		return this.error({
			parameter: context.parameter,
			message: resolved.error,
			context: { ...context, channel }
		});
	}

	public static resolve(channel: GuildChannel): Result<NewsChannel, string> {
		if (isNewsChannel(channel)) return ok(channel);
		return err('The argument did not resolve to a news channel.');
	}
}
