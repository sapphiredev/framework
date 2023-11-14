import { Listener } from '../../lib/structures/Listener';
import { Events, type ContextMenuCommandErrorPayload } from '../../lib/types/Events';

export class CoreListener extends Listener<typeof Events.ContextMenuCommandError> {
	public constructor(context: Listener.Context) {
		super(context, { event: Events.ContextMenuCommandError });
	}

	public run(error: unknown, context: ContextMenuCommandErrorPayload) {
		const { name, location } = context.command;
		this.container.logger.error(`Encountered error on message command "${name}" at path "${location.full}"`, error);
	}
}
