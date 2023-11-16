import { isStageChannel } from '@sapphire/discord.js-utilities';
import type { Message } from 'discord.js';
import { Listener } from '../../lib/structures/Listener';
import type { MessageCommand } from '../../lib/types/CommandTypes';
import { Events, type MessageCommandRunPayload } from '../../lib/types/Events';

export class CoreListener extends Listener<typeof Events.MessageCommandRun> {
	public constructor(context: Listener.LoaderContext) {
		super(context, { event: Events.MessageCommandRun });
		this.enabled = this.container.client.options.typing ?? false;
	}

	public async run(message: Message, command: MessageCommand, payload: MessageCommandRunPayload) {
		if (!command.typing || isStageChannel(message.channel)) {
			return;
		}

		try {
			await message.channel.sendTyping();
		} catch (error) {
			message.client.emit(Events.MessageCommandTypingError, error as Error, { ...payload, command, message });
		}
	}
}
