import { ChannelMentionRegex, SnowflakeRegex } from '@sapphire/discord-utilities';
import type { GuildBasedChannelTypes } from '@sapphire/discord.js-utilities';
import { Result } from '@sapphire/result';
import type { Guild, Snowflake } from 'discord.js';
import { Identifiers } from '../errors/Identifiers';

export function resolveGuildChannel(parameter: string, guild: Guild): Result<GuildBasedChannelTypes, Identifiers.ArgumentGuildChannelError> {
	const channel = resolveById(parameter, guild) ?? resolveByQuery(parameter, guild);
	if (channel) return Result.ok(channel);
	return Result.err(Identifiers.ArgumentGuildChannelError);
}

function resolveById(argument: string, guild: Guild): GuildBasedChannelTypes | null {
	const channelId = ChannelMentionRegex.exec(argument) ?? SnowflakeRegex.exec(argument);
	return channelId ? (guild.channels.cache.get(channelId[1] as Snowflake) as GuildBasedChannelTypes) ?? null : null;
}

function resolveByQuery(argument: string, guild: Guild): GuildBasedChannelTypes | null {
	const lowerCaseArgument = argument.toLowerCase();
	return (guild.channels.cache.find((channel) => channel.name.toLowerCase() === lowerCaseArgument) as GuildBasedChannelTypes) ?? null;
}
