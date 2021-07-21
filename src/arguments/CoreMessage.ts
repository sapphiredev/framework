import { isNewsChannel, isTextChannel, MessageLinkRegex, SnowflakeRegex } from '@sapphire/discord.js-utilities';
import type { PieceContext } from '@sapphire/pieces';
import { DMChannel, Message, NewsChannel, Permissions, Snowflake, TextChannel, ThreadChannel } from 'discord.js';
import { Argument, ArgumentContext, AsyncArgumentResult } from '../lib/structures/Argument';

export interface MessageArgumentContext extends ArgumentContext {
	channel?: DMChannel | NewsChannel | TextChannel;
}

export class CoreArgument extends Argument<Message> {
	public constructor(context: PieceContext) {
		super(context, { name: 'message' });
	}

	public async run(parameter: string, context: MessageArgumentContext): AsyncArgumentResult<Message> {
		const channel = context.channel ?? context.message.channel;
		const message = (await this.resolveById(parameter as Snowflake, channel)) ?? (await this.resolveByLink(parameter, context));
		return message
			? this.ok(message)
			: this.error({
					parameter,
					message: 'The argument did not resolve to a message.',
					context: { ...context, channel }
			  });
	}

	private resolveById(argument: Snowflake, channel: DMChannel | NewsChannel | TextChannel | ThreadChannel): Promise<Message | null> | null {
		return SnowflakeRegex.test(argument) ? channel.messages.fetch(argument).catch(() => null) : null;
	}

	private async resolveByLink(argument: string, { message }: MessageArgumentContext): Promise<Message | null> {
		if (!message.guild) return null;

		const matches = MessageLinkRegex.exec(argument);
		if (!matches) return null;
		const [, guildId, channelId, messageId] = matches;

		const guild = this.container.client.guilds.cache.get(guildId as Snowflake);
		if (guild !== message.guild) return null;

		const channel = guild.channels.cache.get(channelId as Snowflake);
		if (!channel) return null;
		if (!(isNewsChannel(channel) || isTextChannel(channel))) return null;
		if (!channel.viewable) return null;
		if (!channel.permissionsFor(message.author)?.has(Permissions.FLAGS.VIEW_CHANNEL)) return null;

		return channel.messages.fetch(messageId as Snowflake).catch(() => null);
	}
}
