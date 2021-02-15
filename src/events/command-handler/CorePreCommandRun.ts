import type { PieceContext } from '@sapphire/pieces';
import { Event } from '../../lib/structures/Event';
import { Events, PreCommandRunPayload } from '../../lib/types/Events';

export class CoreEvent extends Event<Events.PreCommandRun> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.PreCommandRun });
	}

	public async run(payload: PreCommandRunPayload) {
		const { message, command } = payload;

		// Run essentials:
		const essentialsResult = await this.context.stores.get('essentials').run(message, command, payload);
		if (!essentialsResult.success) {
			message.client.emit(Events.CommandDenied, essentialsResult.error, payload);
			return;
		}

		// Run command-specific preconditions:
		const preconditionsResult = await command.preconditions.run(message, command, payload as any);
		if (!preconditionsResult.success) {
			message.client.emit(Events.CommandDenied, preconditionsResult.error, payload);
			return;
		}

		message.client.emit(Events.CommandAccepted, payload);
	}
}
