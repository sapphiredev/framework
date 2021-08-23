import type { ChannelTypes } from '@sapphire/discord.js-utilities';
import { container } from '@sapphire/pieces';
import type { Message, Snowflake } from 'discord.js';
import { Identifiers } from '../errors/Identifiers';
import { err, ok, Result } from '../parsers/Result';

export function resolveChannel(parameter: string, message: Message): Result<ChannelTypes, Identifiers.ArgumentChannelError> {
	const channel = (message.guild ? message.guild.channels : container.client.channels).cache.get(parameter as Snowflake);
	if (channel) return ok(channel as ChannelTypes);
	return err(Identifiers.ArgumentChannelError);
}
