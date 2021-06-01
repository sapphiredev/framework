import { isNewsChannel, isTextChannel, MessageLinkRegex, SnowflakeRegex } from '@sapphire/discord.js-utilities';
import { PieceContext, container } from '@sapphire/pieces';
import { DMChannel, Message, NewsChannel, Permissions, TextChannel } from 'discord.js';
import { Argument, ArgumentContext, AsyncArgumentResult } from '../lib/structures/Argument';
import { err, ok, Result } from '../lib/parsers/Result';

export interface MessageArgumentContext extends ArgumentContext {
	channel?: DMChannel | NewsChannel | TextChannel;
}

export interface MessageResolverOptions {
	channel?: DMChannel | NewsChannel | TextChannel;
	message: Message;
}

export class CoreArgument extends Argument<Message> {
	public constructor(context: PieceContext) {
		super(context, { name: 'message' });
	}

	public async run(parameter: string, context: MessageArgumentContext): AsyncArgumentResult<Message> {
		const channel = context.channel ?? context.message.channel;

		const resolved = await CoreArgument.resolve(parameter, { channel: context.channel, message: context.message });
		if (resolved.success) return this.ok(resolved.value);
		return this.error({
			parameter,
			message: resolved.error,
			context: { ...context, channel }
		});
	}

	public static async resolve(parameter: string, options: MessageResolverOptions): Promise<Result<Message, string>> {
		const channel = options.channel ?? options.message.channel;
		const message = (await CoreArgument.resolveByID(parameter, channel)) ?? (await CoreArgument.resolveByLink(parameter, options.message));
		if (message) return ok(message);
		return err('The argument did not resolve to a message.');
	}

	private static async resolveByID(argument: string, channel: DMChannel | NewsChannel | TextChannel): Promise<Message | null> {
		return SnowflakeRegex.test(argument) ? channel.messages.fetch(argument).catch(() => null) : null;
	}

	private static async resolveByLink(argument: string, message: Message): Promise<Message | null> {
		if (!message.guild) return null;

		const matches = MessageLinkRegex.exec(argument);
		if (!matches) return null;
		const [, guildID, channelID, messageID] = matches;

		const guild = container.client.guilds.cache.get(guildID);
		if (guild !== message.guild) return null;

		const channel = guild.channels.cache.get(channelID);
		if (!channel) return null;
		if (!(isNewsChannel(channel) || isTextChannel(channel))) return null;
		if (!channel.viewable) return null;
		if (!channel.permissionsFor(message.author)?.has(Permissions.FLAGS.VIEW_CHANNEL)) return null;

		return channel.messages.fetch(messageID).catch(() => null);
	}
}
