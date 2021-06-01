import { isCategoryChannel } from '@sapphire/discord.js-utilities';
import type { PieceContext } from '@sapphire/pieces';
import type { CategoryChannel, GuildChannel } from 'discord.js';
import { err, ok, Result } from '../lib/parsers/Result';
import type { ArgumentResult } from '../lib/structures/Argument';
import { ExtendedArgument, ExtendedArgumentContext } from '../lib/structures/ExtendedArgument';

export class CoreArgument extends ExtendedArgument<'guildChannel', CategoryChannel> {
	public constructor(context: PieceContext) {
		super(context, {
			name: 'categoryChannel',
			baseArgument: 'guildChannel'
		});
	}

	public handle(channel: GuildChannel, context: ExtendedArgumentContext): ArgumentResult<CategoryChannel> {
		const resolved = CoreArgument.resolve(channel);
		if (resolved.success) return this.ok(resolved.value);
		return this.error({
			parameter: context.parameter,
			message: resolved.error,
			context: { ...context, channel }
		});
	}

	public static resolve(channel: GuildChannel): Result<CategoryChannel, string> {
		if (isCategoryChannel(channel)) return ok(channel);
		return err('The argument did not resolve to a category channel.');
	}
}
