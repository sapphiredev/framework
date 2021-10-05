import { ChannelMessageRegex, MessageLinkRegex, SnowflakeRegex } from '@sapphire/discord-utilities';
import { GuildBasedChannelTypes, isNewsChannel, isTextChannel, TextBasedChannelTypes } from '@sapphire/discord.js-utilities';
import { container } from '@sapphire/pieces';
import type { Awaitable } from '@sapphire/utilities';
import { Message, Permissions, Snowflake, User } from 'discord.js';
import { Identifiers } from '../errors/Identifiers';
import { err, ok, Result } from '../parsers/Result';

interface MessageResolverOptions {
	channel?: TextBasedChannelTypes;
	message: Message;
}

export async function resolveMessage(parameter: string, options: MessageResolverOptions): Promise<Result<Message, Identifiers.ArgumentMessageError>> {
	const channel = options.channel ?? options.message.channel;
	const message =
		(await resolveById(parameter, channel)) ??
		(await resolveByLink(parameter, options.message)) ??
		(await resolveByChannelAndMessage(parameter, options.message));
	if (message) return ok(message);
	return err(Identifiers.ArgumentMessageError);
}

function resolveById(parameter: string, channel: TextBasedChannelTypes): Awaitable<Message | null> {
	return SnowflakeRegex.test(parameter) ? channel.messages.fetch(parameter as Snowflake) : null;
}

async function resolveByLink(parameter: string, message: Message): Promise<Message | null> {
	if (!message.guild) return null;

	const matches = MessageLinkRegex.exec(parameter);
	if (!matches) return null;
	const [, guildId, channelId, messageId] = matches;

	const guild = container.client.guilds.cache.get(guildId as Snowflake);
	if (guild !== message.guild) return null;

	return getMessageFromChannel(channelId, messageId, message.author);
}

async function resolveByChannelAndMessage(parameter: string, message: Message): Promise<Message | null> {
	const result = ChannelMessageRegex.exec(parameter)?.groups;
	if (!result) return null;

	return getMessageFromChannel(result.channelId, result.messageId, message.author);
}

async function getMessageFromChannel(channelId: Snowflake, messageId: Snowflake, originalAuthor: User): Promise<Message | null> {
	const channel = container.client.channels.cache.get(channelId) as GuildBasedChannelTypes;
	if (!channel) return null;
	if (!(isNewsChannel(channel) || isTextChannel(channel))) return null;
	if (!channel.viewable) return null;
	if (!channel.permissionsFor(originalAuthor)?.has(Permissions.FLAGS.VIEW_CHANNEL)) return null;

	return channel.messages.fetch(messageId);
}
