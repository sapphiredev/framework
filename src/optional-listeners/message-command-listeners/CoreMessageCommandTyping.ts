import type { PieceContext } from '@sapphire/pieces';
import type { Message } from 'discord.js';
import type { MessageCommand } from '../../lib/structures/Command';
import { Listener } from '../../lib/structures/Listener';
import { Events, MessageCommandRunPayload } from '../../lib/types/Events';

export class CoreListener extends Listener<typeof Events.MessageCommandRun> {
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
