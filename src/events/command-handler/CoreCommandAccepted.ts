import type { PieceContext } from '@sapphire/pieces';
import type { Message } from 'discord.js';
import type { Command } from '../../lib/structures/Command';
import { Event, EventOptions } from '../../lib/structures/Event';
import { Events } from '../../lib/types/Events';

export class CoreEvent extends Event<Events.CommandAccepted> {
	public constructor(context: PieceContext, options: EventOptions = {}) {
		super(context, { ...options, event: Events.CommandAccepted });
	}

	public async run(message: Message, command: Command, commandName: string, prefix: string) {
		const args = await command.preParse(message, commandName, prefix);
		try {
			this.client.emit(Events.CommandRun, message, command);
			const result = await command.run(message, args);
			this.client.emit(Events.CommandFinish, message, command, result);
		} catch (error) {
			this.client.emit(Events.CommandError, error, { piece: command, message });
		}
	}
}
