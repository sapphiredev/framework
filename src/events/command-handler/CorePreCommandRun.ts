import type { PieceContext } from '@sapphire/pieces';
import { Event } from '../../lib/structures/Event';
import { Events, PreCommandRunPayload } from '../../lib/types/Events';

export class CoreEvent extends Event<Events.PreCommandRun> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.PreCommandRun });
	}

	public async run(payload: PreCommandRunPayload) {
		const { message, command } = payload;

		// Run global preconditions:
		const globalResult = await this.container.stores.get('preconditions').run(message, command, payload as any);
		if (!globalResult.success) {
			message.client.emit(Events.CommandDenied, globalResult.error, payload);
			return;
		}

		// Run command-specific preconditions:
		const localResult = await command.preconditions.run(message, command, payload as any);
		if (!localResult.success) {
			message.client.emit(Events.CommandDenied, localResult.error, payload);
			return;
		}

		message.client.emit(Events.CommandAccepted, payload);
	}
}
