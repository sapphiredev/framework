import { ChannelMentionRegex, SnowflakeRegex } from '@sapphire/discord-utilities';
import type { PieceContext } from '@sapphire/pieces';
import type { Guild, GuildChannel, Snowflake, ThreadChannel } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import { Argument, ArgumentContext, ArgumentResult } from '../lib/structures/Argument';

export class CoreArgument extends Argument<GuildChannel | ThreadChannel> {
	public constructor(context: PieceContext) {
		super(context, { name: 'guildChannel' });
	}

	public run(parameter: string, context: ArgumentContext): ArgumentResult<GuildChannel | ThreadChannel> {
		const { guild } = context.message;
		if (!guild) {
			return this.error({
				parameter,
				identifier: Identifiers.ArgumentGuildChannelMissingGuild,
				message: 'The argument must be run in a guild.',
				context: { ...context, guild }
			});
		}

		const channel = this.resolveById(parameter, guild) ?? this.resolveByQuery(parameter, guild);
		return channel
			? this.ok(channel)
			: this.error({
					parameter,
					message: 'The argument did not resolve to a guild channel.',
					context: { ...context, guild }
			  });
	}

	private resolveById(argument: string, guild: Guild): GuildChannel | ThreadChannel | null {
		const channelId = ChannelMentionRegex.exec(argument) ?? SnowflakeRegex.exec(argument);
		return channelId ? guild.channels.cache.get(channelId[1] as Snowflake) ?? null : null;
	}

	private resolveByQuery(argument: string, guild: Guild): GuildChannel | ThreadChannel | null {
		const lowerCaseArgument = argument.toLowerCase();
		return guild.channels.cache.find((channel) => channel.name.toLowerCase() === lowerCaseArgument) ?? null;
	}
}
