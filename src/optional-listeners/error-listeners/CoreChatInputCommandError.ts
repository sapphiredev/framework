import { Listener } from '../../lib/structures/Listener';
import { Events, type ChatInputCommandErrorPayload } from '../../lib/types/Events';

export class CoreEvent extends Listener<typeof Events.ChatInputCommandError> {
	public constructor(context: Listener.Context) {
		super(context, { event: Events.ChatInputCommandError });
	}

	public run(error: unknown, context: ChatInputCommandErrorPayload) {
		const { name, location } = context.command;
		this.container.logger.error(`Encountered error on chat input command "${name}" at path "${location.full}"`, error);
	}
}
