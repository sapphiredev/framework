import type { PieceContext } from '@sapphire/pieces';
import { Listener } from '../../lib/structures/Listener';
import { Events, PreMessageCommandRunPayload } from '../../lib/types/Events';

export class CoreListener extends Listener<typeof Events.PreMessageCommandRun> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.PreMessageCommandRun });
	}

	public async run(payload: PreMessageCommandRunPayload) {
		const { message, command } = payload;

		// Run global preconditions:
		const globalResult = await this.container.stores.get('preconditions').messageRun(message, command, payload as any);
		if (globalResult.isErr()) {
			message.client.emit(Events.MessageCommandDenied, globalResult.unwrapErr(), payload);
			return;
		}

		// Run command-specific preconditions:
		const localResult = await command.preconditions.messageRun(message, command, payload as any);
		if (localResult.isErr()) {
			message.client.emit(Events.MessageCommandDenied, localResult.unwrapErr(), payload);
			return;
		}

		message.client.emit(Events.MessageCommandAccepted, payload);
	}
}
