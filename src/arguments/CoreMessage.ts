import { isNewsChannel, isTextChannel, MessageLinkRegex, SnowflakeRegex } from '@sapphire/discord.js-utilities';
import type { PieceContext } from '@sapphire/pieces';
import { DMChannel, Message, NewsChannel, Permissions, TextChannel } from 'discord.js';
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
		const message = (await this.resolveByID(parameter, channel)) ?? (await this.resolveByLink(parameter, context));
		return message
			? this.ok(message)
			: this.error({
					parameter,
					message: 'The argument did not resolve to a message.',
					context: { ...context, channel }
			  });
	}

	private async resolveByID(argument: string, channel: DMChannel | NewsChannel | TextChannel): Promise<Message | null> {
		return SnowflakeRegex.test(argument) ? channel.messages.fetch(argument).catch(() => null) : null;
	}

	private async resolveByLink(argument: string, { message }: MessageArgumentContext): Promise<Message | null> {
		if (!message.guild) return null;

		const matches = MessageLinkRegex.exec(argument);
		if (!matches) return null;
		const [, guildID, channelID, messageID] = matches;

		const guild = this.container.client.guilds.cache.get(guildID);
		if (guild !== message.guild) return null;

		const channel = guild.channels.cache.get(channelID);
		if (!channel) return null;
		if (!(isNewsChannel(channel) || isTextChannel(channel))) return null;
		if (!channel.viewable) return null;
		if (!channel.permissionsFor(message.author)?.has(Permissions.FLAGS.VIEW_CHANNEL)) return null;

		return channel.messages.fetch(messageID).catch(() => null);
	}
}
