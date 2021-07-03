import type { PieceContext } from '@sapphire/pieces';
import { Listener } from '../../lib/structures/Listener';
import { CommandAcceptedPayload, Events } from '../../lib/types/Events';

export class CoreListener extends Listener<typeof Events.CommandAccepted> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.CommandAccepted });
	}

	public async run(payload: CommandAcceptedPayload) {
		const { message, command, parameters, context } = payload;
		const args = await command.preParse(message, parameters, context);
		try {
			message.client.emit(Events.CommandRun, message, command, { ...payload, args });
			const result = await command.run(message, args, context);
			message.client.emit(Events.CommandSuccess, { ...payload, args, result });
		} catch (error) {
			message.client.emit(Events.CommandError, error, { ...payload, args, piece: command });
		} finally {
			message.client.emit(Events.CommandFinish, message, command, { ...payload, args });
		}
	}
}
