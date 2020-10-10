import type { PieceContext } from '@sapphire/pieces';
import { Event } from '../../lib/structures/Event';
import { CommandAcceptedPayload, Events } from '../../lib/types/Events';

export class CoreEvent extends Event<Events.CommandAccepted> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.CommandAccepted });
	}

	public async run({ message, command, parameters }: CommandAcceptedPayload) {
		const args = await command.preParse(message, parameters);
		try {
			this.client.emit(Events.CommandRun, message, command);
			const result = await command.run(message, args);
			this.client.emit(Events.CommandSuccess, { message, command, result, parameters });
		} catch (error) {
			this.client.emit(Events.CommandError, error, { piece: command, message });
		} finally {
			this.client.emit(Events.CommandFinish, message, command);
		}
	}
}
