import type { MessageCommand } from '../../lib/structures/Command';
import type { Message } from 'discord.js';
import type { PieceContext } from '@sapphire/pieces';
import { Listener } from '../../lib/structures/Listener';
import { MessageCommandRunPayload, Events } from '../../lib/types/Events';

export class CoreListener extends Listener {
	public constructor(context: PieceContext) {
		super(context, { event: Events.MessageCommandRun });
		this.enabled = this.container.client.options.typing ?? false;
	}

	public async run(message: Message, command: MessageCommand, payload: MessageCommandRunPayload) {
		if (!command.typing) return;

		try {
			await message.channel.sendTyping();
		} catch (error) {
			message.client.emit(Events.MessageCommandTypingError, error as Error, { ...payload, command, message });
		}
	}
}
