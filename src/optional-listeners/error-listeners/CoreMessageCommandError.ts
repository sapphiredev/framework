import type { PieceContext } from '@sapphire/pieces';
import { Listener } from '../../lib/structures/Listener';
import { SapphireEvents, MessageCommandErrorPayload } from '../../lib/types/Events';

export class CoreEvent extends Listener<typeof SapphireEvents.MessageCommandError> {
	public constructor(context: PieceContext) {
		super(context, { event: SapphireEvents.MessageCommandError });
	}

	public run(error: unknown, context: MessageCommandErrorPayload) {
		const { name, location } = context.command;
		this.container.logger.error(`Encountered error on message command "${name}" at path "${location.full}"`, error);
	}
}
