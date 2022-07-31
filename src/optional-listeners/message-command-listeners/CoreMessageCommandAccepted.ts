import type { PieceContext } from '@sapphire/pieces';
import { fromAsync, isErr } from '@sapphire/result';
import { Stopwatch } from '@sapphire/stopwatch';
import { Listener } from '../../lib/structures/Listener';
import { SapphireEvents, MessageCommandAcceptedPayload } from '../../lib/types/Events';

export class CoreListener extends Listener<typeof SapphireEvents.MessageCommandAccepted> {
	public constructor(context: PieceContext) {
		super(context, { event: SapphireEvents.MessageCommandAccepted });
	}

	public async run(payload: MessageCommandAcceptedPayload) {
		const { message, command, parameters, context } = payload;
		const args = await command.messagePreParse(message, parameters, context);

		const result = await fromAsync(async () => {
			message.client.emit(SapphireEvents.MessageCommandRun, message, command, { ...payload, args });

			const stopwatch = new Stopwatch();
			const result = await command.messageRun(message, args, context);
			const { duration } = stopwatch.stop();

			message.client.emit(SapphireEvents.MessageCommandSuccess, { ...payload, args, result, duration });

			return duration;
		});

		if (isErr(result)) {
			message.client.emit(SapphireEvents.MessageCommandError, result.error, { ...payload, args, duration: result.value ?? -1 });
		}

		message.client.emit(SapphireEvents.MessageCommandFinish, message, command, {
			...payload,
			args,
			success: !isErr(result),
			duration: result.value ?? -1
		});
	}
}
