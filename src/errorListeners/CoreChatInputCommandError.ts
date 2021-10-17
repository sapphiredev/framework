import type { PieceContext } from '@sapphire/pieces';
import { Listener } from '../lib/structures/Listener';
import { ChatInputCommandErrorPayload, Events } from '../lib/types/Events';

export class CoreEvent extends Listener<typeof Events.ChatInputCommandError> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.ChatInputCommandError });
	}

	public run(error: Error, context: ChatInputCommandErrorPayload) {
		const { name, location } = context.command;
		this.container.logger.error(`Encountered error on message command "${name}" at path "${location.full}"`, error);
	}
}
