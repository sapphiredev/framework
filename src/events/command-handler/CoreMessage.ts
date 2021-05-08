import type { PieceContext } from '@sapphire/pieces';
import type { Message } from 'discord.js';
import { Event } from '../../lib/structures/Event';
import { Events } from '../../lib/types/Events';

export class CoreEvent extends Event<Events.Message> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.Message });
	}

	public run(message: Message) {
		// Stop bots and webhooks from running commands.
		if (message.author.bot || message.webhookID) return;

		// Run the message parser.
		this.container.client.emit(Events.PreMessageParsed, message);
	}
}
