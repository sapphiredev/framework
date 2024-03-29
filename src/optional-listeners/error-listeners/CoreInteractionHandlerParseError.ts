import { Listener } from '../../lib/structures/Listener';
import { Events, type InteractionHandlerParseError as InteractionHandlerParseErrorPayload } from '../../lib/types/Events';

export class CoreListener extends Listener<typeof Events.InteractionHandlerParseError> {
	public constructor(context: Listener.LoaderContext) {
		super(context, { event: Events.InteractionHandlerParseError });
	}

	public run(error: unknown, context: InteractionHandlerParseErrorPayload) {
		const { name, location } = context.handler;
		this.container.logger.error(
			`Encountered error while handling an interaction handler parse method for interaction-handler "${name}" at path "${location.full}"`,
			error
		);
	}
}
