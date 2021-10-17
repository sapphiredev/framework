import type { PieceContext } from '@sapphire/pieces';
import { Listener } from '../lib/structures/Listener';
import { Events, ListenerErrorPayload } from '../lib/types/Events';

export class CoreEvent extends Listener<typeof Events.ListenerError> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.ListenerError });
	}

	public run(error: Error, context: ListenerErrorPayload) {
		const { name, event, location } = context.piece;
		this.container.logger.error(`Encountered error on event listener "${name}" for event "${event}" at path "${location.full}"`, error);
	}
}
