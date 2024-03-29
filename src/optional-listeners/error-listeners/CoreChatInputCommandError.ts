import { Listener } from '../../lib/structures/Listener';
import { Events, type ChatInputCommandErrorPayload } from '../../lib/types/Events';

export class CoreListener extends Listener<typeof Events.ChatInputCommandError> {
	public constructor(context: Listener.LoaderContext) {
		super(context, { event: Events.ChatInputCommandError });
	}

	public run(error: unknown, context: ChatInputCommandErrorPayload) {
		const { name, location } = context.command;
		this.container.logger.error(`Encountered error on chat input command "${name}" at path "${location.full}"`, error);
	}
}
