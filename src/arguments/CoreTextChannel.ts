import { isTextChannel } from '@sapphire/discord.js-utilities';
import type { PieceContext } from '@sapphire/pieces';
import type { GuildChannel, TextChannel } from 'discord.js';
import type { ArgumentResult } from '../lib/structures/Argument';
import { ExtendedArgument, ExtendedArgumentContext } from '../lib/structures/ExtendedArgument';
import { err, ok, Result } from '../lib/parsers/Result';

export class CoreArgument extends ExtendedArgument<'guildChannel', TextChannel> {
	public constructor(context: PieceContext) {
		super(context, {
			name: 'textChannel',
			baseArgument: 'guildChannel'
		});
	}

	public handle(channel: GuildChannel, context: ExtendedArgumentContext): ArgumentResult<TextChannel> {
		const resolved = CoreArgument.resolve(channel);
		if (resolved.success) return this.ok(resolved.value);
		return this.error({
			parameter: context.parameter,
			message: resolved.error,
			context: { ...context, channel }
		});
	}

	public static resolve(channel: GuildChannel): Result<TextChannel, string> {
		if (isTextChannel(channel)) return ok(channel);
		return err('The argument did not resolve to a text channel.');
	}
}
