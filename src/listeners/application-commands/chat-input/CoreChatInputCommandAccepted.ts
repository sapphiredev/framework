import type { PieceContext } from '@sapphire/pieces';
import { fromAsync, isErr } from '@sapphire/result';
import { Stopwatch } from '@sapphire/stopwatch';
import { Listener } from '../../../lib/structures/Listener';
import { ChatInputCommandAcceptedPayload, SapphireEvents } from '../../../lib/types/Events';

export class CoreListener extends Listener<typeof SapphireEvents.ChatInputCommandAccepted> {
	public constructor(context: PieceContext) {
		super(context, { event: SapphireEvents.ChatInputCommandAccepted });
	}

	public async run(payload: ChatInputCommandAcceptedPayload) {
		const { command, context, interaction } = payload;

		const result = await fromAsync(async () => {
			this.container.client.emit(SapphireEvents.ChatInputCommandRun, interaction, command, { ...payload });

			const stopwatch = new Stopwatch();
			const result = await command.chatInputRun(interaction, context);
			const { duration } = stopwatch.stop();

			this.container.client.emit(SapphireEvents.ChatInputCommandSuccess, { ...payload, result, duration });

			return duration;
		});

		if (isErr(result)) {
			this.container.client.emit(SapphireEvents.ChatInputCommandError, result.error, { ...payload, duration: result.value ?? -1 });
		}

		this.container.client.emit(SapphireEvents.ChatInputCommandFinish, interaction, command, {
			...payload,
			success: !isErr(result),
			duration: result.value ?? -1
		});
	}
}
