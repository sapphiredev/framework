import type { PieceContext } from '@sapphire/pieces';
import { Listener } from '../../lib/structures/Listener';
import { ChatInputCommandErrorPayload, SapphireEvents } from '../../lib/types/Events';

export class CoreEvent extends Listener<typeof SapphireEvents.ChatInputCommandError> {
	public constructor(context: PieceContext) {
		super(context, { event: SapphireEvents.ChatInputCommandError });
	}

	public run(error: unknown, context: ChatInputCommandErrorPayload) {
		const { name, location } = context.command;
		this.container.logger.error(`Encountered error on chat input command "${name}" at path "${location.full}"`, error);
	}
}
