import { Result } from '@sapphire/result';
import { Stopwatch } from '@sapphire/stopwatch';
import { Listener } from '../../../lib/structures/Listener';
import { Events, type ChatInputCommandAcceptedPayload } from '../../../lib/types/Events';

export class CoreListener extends Listener<typeof Events.ChatInputCommandAccepted> {
	public constructor(context: Listener.Context) {
		super(context, { event: Events.ChatInputCommandAccepted });
	}

	public async run(payload: ChatInputCommandAcceptedPayload) {
		const { command, context, interaction } = payload;
		const args = await command.chatInputPreParse(interaction, context);

		const result = await Result.fromAsync(async () => {
			this.container.client.emit(Events.ChatInputCommandRun, interaction, command, { ...payload, args });

			const stopwatch = new Stopwatch();
			const result = await command.chatInputRun(interaction, args, context);
			const { duration } = stopwatch.stop();

			this.container.client.emit(Events.ChatInputCommandSuccess, { ...payload, args, result, duration });

			return duration;
		});

		result.inspectErr((error) => this.container.client.emit(Events.ChatInputCommandError, error, { ...payload, args, duration: -1 }));

		this.container.client.emit(Events.ChatInputCommandFinish, interaction, command, {
			...payload,
			args,
			success: result.isOk(),
			duration: result.unwrapOr(-1)
		});
	}
}
