import { Listener } from '../../lib/structures/Listener';
import { Events, type InteractionHandlerError } from '../../lib/types/Events';

export class CoreListener extends Listener<typeof Events.InteractionHandlerError> {
	public constructor(context: Listener.LoaderContext) {
		super(context, { event: Events.InteractionHandlerError });
	}

	public run(error: unknown, context: InteractionHandlerError) {
		const { name, location } = context.handler;
		this.container.logger.error(
			`Encountered error while handling an interaction handler run method for interaction-handler "${name}" at path "${location.full}"`,
			error
		);
	}
}
