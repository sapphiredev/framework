import { ChannelMentionRegex, ChannelTypes } from '@sapphire/discord.js-utilities';
import { container } from '@sapphire/pieces';
import type { Message, Snowflake } from 'discord.js';
import { Identifiers } from '../errors/Identifiers';
import { err, ok, Result } from '../parsers/Result';

export function resolveChannel(parameter: string, message: Message): Result<ChannelTypes, Identifiers.ArgumentChannelError> {
	const channelId = (ChannelMentionRegex.exec(parameter)?.[1] ?? parameter) as Snowflake;
	const channel = (message.guild ? message.guild.channels : container.client.channels).cache.get(channelId);
	if (channel) return ok(channel as ChannelTypes);
	return err(Identifiers.ArgumentChannelError);
}
