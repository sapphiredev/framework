import type { PieceContext } from '@sapphire/pieces';
import { Result } from '@sapphire/result';
import { Stopwatch } from '@sapphire/stopwatch';
import { Listener } from '../../../lib/structures/Listener';
import { ChatInputCommandAcceptedPayload, Events } from '../../../lib/types/Events';

export class CoreListener extends Listener<typeof Events.ChatInputCommandAccepted> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.ChatInputCommandAccepted });
	}

	public async run(payload: ChatInputCommandAcceptedPayload) {
		const { command, context, interaction } = payload;

		const result = await Result.fromAsync(async () => {
			this.container.client.emit(Events.ChatInputCommandRun, interaction, command, { ...payload });

			const stopwatch = new Stopwatch();
			const result = await command.chatInputRun(interaction, context);
			const { duration } = stopwatch.stop();

			this.container.client.emit(Events.ChatInputCommandSuccess, { ...payload, result, duration });

			return duration;
		});

		result.inspectErr((error) => this.container.client.emit(Events.ChatInputCommandError, error, { ...payload, duration: -1 }));

		this.container.client.emit(Events.ChatInputCommandFinish, interaction, command, {
			...payload,
			success: result.isOk(),
			duration: result.unwrapOr(-1)
		});
	}
}
