import type { PieceContext } from '@sapphire/pieces';
import type { Message } from 'discord.js';
import type { Command } from '../../lib/structures/Command';
import { Event } from '../../lib/structures/Event';
import { Events } from '../../lib/types/Events';
import { isErr } from '../../lib/utils/Result';

export class CoreEvent extends Event {
	public constructor(context: PieceContext) {
		super(context, { event: 'preCommandRun' });
	}

	public async run(message: Message, command: Command, commandName: string, prefix: string) {
		const result = await command.preconditions.run(message, command);
		if (isErr(result)) {
			this.client.emit(Events.CommandDenied, message, command, commandName, prefix);
		} else {
			this.client.emit(Events.CommandAccepted, message, command, commandName, prefix);
		}
	}
}
