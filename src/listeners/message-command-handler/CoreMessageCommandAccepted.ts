import type { PieceContext } from '@sapphire/pieces';
import { Listener } from '../../lib/structures/Listener';
import { MessageCommandAcceptedPayload, Events } from '../../lib/types/Events';
import { isErr, fromAsync } from '../../lib/parsers/Result';

export class CoreListener extends Listener<typeof Events.MessageCommandAccepted> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.MessageCommandAccepted });
	}

	public async run(payload: MessageCommandAcceptedPayload) {
		const { message, command, parameters, context } = payload;
		const args = await command.messagePreParse(message, parameters, context);
		const result = await fromAsync(async () => {
			message.client.emit(Events.MessageCommandRun, message, command, { ...payload, args });
			const result = await command.messageRun(message, args, context);
			message.client.emit(Events.MessageCommandSuccess, { ...payload, args, result });
		});

		if (isErr(result)) {
			message.client.emit(Events.MessageCommandError, result.error, { ...payload, args });
		}

		message.client.emit(Events.MessageCommandFinish, message, command, { ...payload, args });
	}
}
