import { ChannelMessageRegex, MessageLinkRegex, SnowflakeRegex } from '@sapphire/discord-utilities';
import {
	GuildBasedChannelTypes,
	isGuildBasedChannel,
	isNewsChannel,
	isTextBasedChannel,
	isTextChannel,
	TextBasedChannelTypes
} from '@sapphire/discord.js-utilities';
import { container } from '@sapphire/pieces';
import { Result } from '@sapphire/result';
import type { Awaitable } from '@sapphire/utilities';
import { Message, Permissions, Snowflake, User } from 'discord.js';
import { Identifiers } from '../errors/Identifiers';

/**
 * Options to resolve a message from a string, given a certain context.
 */
export interface MessageResolverOptions {
	/**
	 * Channel to resolve the message in.
	 * @default message.channel
	 */
	channel?: TextBasedChannelTypes;
	/**
	 * Base message to resolve the message from (e.g. pick the channel if not given).
	 */
	message: Message;
	/**
	 * Whether to scan the entire guild cache for the message.
	 * If channel is given with this option, this option is ignored.
	 * @default false
	 */
	scan?: boolean;
}

export async function resolveMessage(parameter: string, options: MessageResolverOptions): Promise<Result<Message, Identifiers.ArgumentMessageError>> {
	const message =
		(await resolveById(parameter, options)) ??
		(await resolveByLink(parameter, options.message)) ??
		(await resolveByChannelAndMessage(parameter, options.message));
	if (message) return Result.ok(message);
	return Result.err(Identifiers.ArgumentMessageError);
}

function resolveById(parameter: string, options: MessageResolverOptions): Awaitable<Message | null> {
	if (!SnowflakeRegex.test(parameter)) return null;

	if (options.channel) return options.channel.messages.fetch(parameter as Snowflake);

	if (options.scan && isGuildBasedChannel(options.message.channel)) {
		for (const channel of options.message.channel.guild.channels.cache.values()) {
			if (!isTextBasedChannel(channel)) continue;

			const message = channel.messages.cache.get(parameter);
			if (message) return message;
		}
	}

	return options.message.channel.messages.fetch(parameter as Snowflake);
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
