import type { PieceContext } from '@sapphire/pieces';
import { Listener } from '../../lib/structures/Listener';
import { SapphireEvents, ListenerErrorPayload } from '../../lib/types/Events';

export class CoreEvent extends Listener<typeof SapphireEvents.ListenerError> {
	public constructor(context: PieceContext) {
		super(context, { event: SapphireEvents.ListenerError });
	}

	public run(error: unknown, context: ListenerErrorPayload) {
		const { name, event, location } = context.piece;
		this.container.logger.error(`Encountered error on event listener "${name}" for event "${String(event)}" at path "${location.full}"`, error);
	}
}
