import type { PieceContext } from '@sapphire/pieces';
import { Event } from '../lib/structures/Event';
import { EventErrorPayload, Events } from '../lib/types/Events';

export class CoreEvent extends Event<Events.EventError> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.EventError });
	}

	public run(error: Error, context: EventErrorPayload) {
		const { name, event, path } = context.piece;
		this.context.logger.error(`Encountered error on event listener "${name}" for event "${event}" at path "${path}"`, error.stack);
	}
}
