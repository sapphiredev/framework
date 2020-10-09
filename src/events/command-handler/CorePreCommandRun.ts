import type { PieceContext } from '@sapphire/pieces';
import type { Message } from 'discord.js';
import type { Command } from '../../lib/structures/Command';
import { Event } from '../../lib/structures/Event';
import { Events } from '../../lib/types/Events';
import { isErr } from '../../lib/utils/Result';

export class CoreEvent extends Event<Events.PreCommandRun> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.PreCommandRun });
	}

	public async run(message: Message, command: Command, parameters: string, commandName: string, prefix: string) {
		const result = await command.preconditions.run(message, command);
		if (isErr(result)) {
			this.client.emit(Events.CommandDenied, result.error, { message, command, parameters, commandName, prefix });
		} else {
			this.client.emit(Events.CommandAccepted, message, command, parameters, commandName, prefix);
		}
	}
}
