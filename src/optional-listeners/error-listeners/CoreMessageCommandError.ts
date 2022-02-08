import type { PieceContext } from '@sapphire/pieces';
import { Listener } from '../../lib/structures/Listener';
import { Events, MessageCommandErrorPayload } from '../../lib/types/Events';

export class CoreEvent extends Listener<typeof Events.MessageCommandError> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.MessageCommandError });
	}

	public run(error: unknown, context: MessageCommandErrorPayload) {
		const { name, location } = context.command;
		this.container.logger.error(`Encountered error on message command "${name}" at path "${location.full}"`, error);
	}
}
