import { Listener } from '../../lib/structures/Listener';
import { Events, type MessageCommandErrorPayload } from '../../lib/types/Events';

export class CoreListener extends Listener<typeof Events.MessageCommandError> {
	public constructor(context: Listener.Context) {
		super(context, { event: Events.MessageCommandError });
	}

	public run(error: unknown, context: MessageCommandErrorPayload) {
		const { name, location } = context.command;
		this.container.logger.error(`Encountered error on message command "${name}" at path "${location.full}"`, error);
	}
}
