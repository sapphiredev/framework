import type { PieceContext } from '@sapphire/pieces';
import { fromAsync, isErr } from '../../lib/parsers/Result';
import { Listener } from '../../lib/structures/Listener';
import { CommandAcceptedPayload, Events } from '../../lib/types/Events';

export class CoreListener extends Listener<typeof Events.CommandAccepted> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.CommandAccepted });
	}

	public async run(payload: CommandAcceptedPayload) {
		const { message, command, parameters, context } = payload;
		const args = await command.preParse(message, parameters, context);
		const result = await fromAsync(async () => {
			message.client.emit(Events.CommandRun, message, command, { ...payload, args });
			const result = await command.messageRun(message, args, context);
			message.client.emit(Events.CommandSuccess, { ...payload, args, result });
		});

		if (isErr(result)) {
			message.client.emit(Events.CommandError, result.error, { ...payload, args, piece: command });
		}

		message.client.emit(Events.CommandFinish, message, command, { ...payload, args });
	}
}
