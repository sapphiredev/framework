import type { PieceContext } from '@sapphire/pieces';
import { DMChannel, Message, NewsChannel, Permissions, TextChannel } from 'discord.js';
import { Argument, ArgumentContext, AsyncArgumentResult } from '../lib/structures/Argument';

export interface MessageArgumentContext extends ArgumentContext {
	channel?: DMChannel | NewsChannel | TextChannel;
}

export class CoreArgument extends Argument<Message> {
	private readonly messageLinkRegex = /^(?:https:\/\/)?(?:ptb\.|canary\.)?discord(?:app)?\.com\/channels\/(\d{17,19})\/(\d{17,19})\/(\d{17,19})$/;
	private readonly snowflakeRegex = /^\d{17,19}$/;

	public constructor(context: PieceContext) {
		super(context, { name: 'message' });
	}

	public async run(argument: string, context: MessageArgumentContext): AsyncArgumentResult<Message> {
		const message = (await this.resolveByID(argument, context)) ?? (await this.resolveByLink(argument, context));
		return message ? this.ok(message) : this.error(argument, 'ArgumentMessageUnknownMessage', 'The argument did not resolve to a message.');
	}

	private async resolveByID(argument: string, context: MessageArgumentContext): Promise<Message | null> {
		const channel = context.channel ?? context.message.channel;
		return this.snowflakeRegex.test(argument) ? channel.messages.fetch(argument).catch(() => null) : null;
	}

	private async resolveByLink(argument: string, { message }: MessageArgumentContext): Promise<Message | null> {
		if (!message.guild) return null;

		const matches = this.messageLinkRegex.exec(argument);
		if (!matches) return null;
		const [, guildID, channelID, messageID] = matches;

		const guild = this.client.guilds.cache.get(guildID);
		if (guild !== message.guild) return null;

		const channel = guild.channels.cache.get(channelID);
		if (!channel) return null;
		if (!(channel instanceof NewsChannel || channel instanceof TextChannel)) return null;
		if (!channel.viewable) return null;
		if (!channel.permissionsFor(message.author)?.has(Permissions.FLAGS.VIEW_CHANNEL)) return null;

		return channel.messages.fetch(messageID).catch(() => null);
	}
}
