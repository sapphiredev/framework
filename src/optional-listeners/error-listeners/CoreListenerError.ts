import { Listener } from '../../lib/structures/Listener';
import { Events, type ListenerErrorPayload } from '../../lib/types/Events';

export class CoreListener extends Listener<typeof Events.ListenerError> {
	public constructor(context: Listener.LoaderContext) {
		super(context, { event: Events.ListenerError });
	}

	public run(error: unknown, context: ListenerErrorPayload) {
		const { name, event, location } = context.piece;
		this.container.logger.error(`Encountered error on event listener "${name}" for event "${String(event)}" at path "${location.full}"`, error);
	}
}
