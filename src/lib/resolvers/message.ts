import { MessageLinkRegex, SnowflakeRegex } from '@sapphire/discord-utilities';
import { GuildBasedChannelTypes, isNewsChannel, isTextChannel, TextBasedChannelTypes } from '@sapphire/discord.js-utilities';
import { container } from '@sapphire/pieces';
import type { Awaited } from '@sapphire/utilities';
import { Message, Permissions, Snowflake } from 'discord.js';
import { Identifiers } from '../errors/Identifiers';
import { err, ok, Result } from '../parsers/Result';

interface MessageResolverOptions {
	channel?: TextBasedChannelTypes;
	message: Message;
}

export async function resolveMessage(parameter: string, options: MessageResolverOptions): Promise<Result<Message, Identifiers.ArgumentMessageError>> {
	const channel = options.channel ?? options.message.channel;
	const message = (await resolveById(parameter, channel)) ?? (await resolveByLink(parameter, options.message));
	if (message) return ok(message);
	return err(Identifiers.ArgumentMessageError);
}

function resolveById(parameter: string, channel: TextBasedChannelTypes): Awaited<Message | null> {
	return SnowflakeRegex.test(parameter) ? channel.messages.fetch(parameter as Snowflake) : null;
}

async function resolveByLink(parameter: string, message: Message): Promise<Message | null> {
	if (!message.guild) return null;

	const matches = MessageLinkRegex.exec(parameter);
	if (!matches) return null;
	const [, guildId, channelId, messageId] = matches;

	const guild = container.client.guilds.cache.get(guildId as Snowflake);
	if (guild !== message.guild) return null;

	const channel = guild.channels.cache.get(channelId as Snowflake) as GuildBasedChannelTypes;
	if (!channel) return null;
	if (!(isNewsChannel(channel) || isTextChannel(channel))) return null;
	if (!channel.viewable) return null;
	if (!channel.permissionsFor(message.author)?.has(Permissions.FLAGS.VIEW_CHANNEL)) return null;

	return channel.messages.fetch(messageId as Snowflake);
}
