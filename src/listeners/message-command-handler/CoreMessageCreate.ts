import type { PieceContext } from '@sapphire/pieces';
import type { Message } from 'discord.js';
import { Listener } from '../../lib/structures/Listener';
import { Events } from '../../lib/types/Events';

export class CoreListener extends Listener<typeof Events.MessageCreate> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.MessageCreate });
	}

	public run(message: Message) {
		// Stop bots and webhooks from running commands.
		if (message.author.bot || message.webhookId) return;

		// Run the message parser.
		this.container.client.emit(Events.PreMessageParsed, message);
	}
}
