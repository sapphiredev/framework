import { ChannelMessageRegex, MessageLinkRegex, SnowflakeRegex } from '@sapphire/discord-utilities';
import {
	AnyInteraction,
	isAnyInteraction,
	isGuildBasedChannel,
	isNewsChannel,
	isStageChannel,
	isTextBasedChannel,
	isTextChannel,
	type GuildBasedChannelTypes,
	type TextBasedChannelTypes
} from '@sapphire/discord.js-utilities';
import { container } from '@sapphire/pieces';
import { Result } from '@sapphire/result';
import type { Awaitable } from '@sapphire/utilities';
import { PermissionFlagsBits, type Message, type Snowflake, type User } from 'discord.js';
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
	 * Base {@link Message} or {@link AnyInteraction} to resolve the message from (e.g. pick the channel if not given).
	 */
	messageOrInteraction: Message | AnyInteraction;
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
		(await resolveByLink(parameter, options)) ??
		(await resolveByChannelAndMessage(parameter, options));

	if (message) {
		return Result.ok(message);
	}

	return Result.err(Identifiers.ArgumentMessageError);
}

function resolveById(parameter: string, options: MessageResolverOptions): Awaitable<Message | null> {
	if (!SnowflakeRegex.test(parameter) || isStageChannel(options.messageOrInteraction.channel)) {
		return null;
	}

	if (options.channel && !isStageChannel(options.channel)) {
		return options.channel.messages.fetch(parameter as Snowflake);
	}

	if (options.scan && isGuildBasedChannel(options.messageOrInteraction.channel)) {
		for (const channel of options.messageOrInteraction.channel.guild.channels.cache.values()) {
			if (!isTextBasedChannel(channel) || isStageChannel(channel)) {
				continue;
			}

			const message = channel.messages.cache.get(parameter);
			if (message) {
				return message;
			}
		}
	}

	return options.messageOrInteraction.channel?.messages.fetch(parameter as Snowflake) ?? null;
}

async function resolveByLink(parameter: string, options: MessageResolverOptions): Promise<Message | null> {
	if (!options.messageOrInteraction.guild) {
		return null;
	}

	const matches = MessageLinkRegex.exec(parameter);
	if (!matches) {
		return null;
	}

	const [, guildId, channelId, messageId] = matches;

	const guild = container.client.guilds.cache.get(guildId as Snowflake);
	if (guild !== options.messageOrInteraction.guild) {
		return null;
	}

	return getMessageFromChannel(
		channelId,
		messageId,
		isAnyInteraction(options.messageOrInteraction) ? options.messageOrInteraction.user : options.messageOrInteraction.author
	);
}

async function resolveByChannelAndMessage(parameter: string, options: MessageResolverOptions): Promise<Message | null> {
	const result = ChannelMessageRegex.exec(parameter)?.groups;

	if (!result) {
		return null;
	}

	return getMessageFromChannel(
		result.channelId,
		result.messageId,
		isAnyInteraction(options.messageOrInteraction) ? options.messageOrInteraction.user : options.messageOrInteraction.author
	);
}

async function getMessageFromChannel(channelId: Snowflake, messageId: Snowflake, originalAuthor: User): Promise<Message | null> {
	const channel = container.client.channels.cache.get(channelId) as GuildBasedChannelTypes;
	if (!channel) {
		return null;
	}

	if (!(isNewsChannel(channel) || isTextChannel(channel))) {
		return null;
	}

	if (!channel.viewable) {
		return null;
	}

	if (!channel.permissionsFor(originalAuthor)?.has(PermissionFlagsBits.ViewChannel)) {
		return null;
	}

	return channel.messages.fetch(messageId);
}
