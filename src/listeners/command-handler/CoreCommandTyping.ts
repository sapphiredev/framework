import type { PieceContext } from '@sapphire/pieces';
import type { Message } from 'discord.js';
import type { Command } from '../../lib/structures/Command';
import { Listener } from '../../lib/structures/Listener';
import { CommandRunPayload, Events } from '../../lib/types/Events';

export class CoreListener extends Listener<typeof Events.CommandRun> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.CommandRun });
		this.enabled = this.container.client.options.typing ?? false;
	}

	public async run(message: Message, command: Command, payload: CommandRunPayload) {
		if (!command.typing) return;

		try {
			await message.channel.sendTyping();
		} catch (error) {
			message.client.emit(Events.CommandTypingError, error, { ...payload, command, message });
		}
	}
}
