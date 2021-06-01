import { ChannelMentionRegex, SnowflakeRegex } from '@sapphire/discord-utilities';
import type { PieceContext } from '@sapphire/pieces';
import type { Guild, GuildChannel } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { Argument, ArgumentContext, ArgumentResult } from '../lib/structures/Argument';
import { err, ok, Result } from '../lib/parsers/Result';

export class CoreArgument extends Argument<GuildChannel> {
	public constructor(context: PieceContext) {
		super(context, { name: 'guildChannel' });
	}

	public run(parameter: string, context: ArgumentContext): ArgumentResult<GuildChannel> {
		const { guild } = context.message;
		if (!guild) {
			return this.error({
				parameter,
				identifier: Identifiers.ArgumentGuildChannelMissingGuild,
				message: 'The argument must be run in a guild.',
				context: { ...context, guild }
			});
		}

		const resolved = CoreArgument.resolve(parameter, guild);
		if (resolved.success) return this.ok(resolved.value);
		return this.error({
			parameter,
			message: resolved.error,
			context: { ...context, guild }
		});
	}

	public static resolve(parameter: string, guild: Guild): Result<GuildChannel, string> {
		const channel = CoreArgument.resolveByID(parameter, guild) ?? CoreArgument.resolveByQuery(parameter, guild);
		if (channel) return ok(channel);
		return err('The argument did not resolve to a guild channel.');
	}

	private static resolveByID(argument: string, guild: Guild): GuildChannel | null {
		const channelID = ChannelMentionRegex.exec(argument) ?? SnowflakeRegex.exec(argument);
		return channelID ? guild.channels.cache.get(channelID[1]) ?? null : null;
	}

	private static resolveByQuery(argument: string, guild: Guild): GuildChannel | null {
		const lowerCaseArgument = argument.toLowerCase();
		return guild.channels.cache.find((channel) => channel.name.toLowerCase() === lowerCaseArgument) ?? null;
	}
}
