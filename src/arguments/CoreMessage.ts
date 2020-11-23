import type { PieceContext } from '@sapphire/pieces';
import type { DMChannel, Message, NewsChannel, TextChannel } from 'discord.js';
import { Argument, ArgumentContext, AsyncArgumentResult } from '../lib/structures/Argument';

export class CoreArgument extends Argument<Message> {
	private readonly snowflakeRegex = /^\d{17,19}$/;

	public constructor(context: PieceContext) {
		super(context, { name: 'message' });
	}

	public async run(argument: string, context: ArgumentContext): AsyncArgumentResult<Message> {
		const channel = (context.channel as DMChannel | NewsChannel | TextChannel | undefined) ?? context.message.channel;
		const message = this.snowflakeRegex.test(argument) ? await channel.messages.fetch(argument).catch(() => null) : null;
		return message ? this.ok(message) : this.error(argument, 'ArgumentMessageUnknownMessage', 'The argument did not resolve to a message.');
	}
}
