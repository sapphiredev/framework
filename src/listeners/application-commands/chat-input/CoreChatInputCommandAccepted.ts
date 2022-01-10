import type { PieceContext } from '@sapphire/pieces';
import { Stopwatch } from '@sapphire/stopwatch';
import { fromAsync, isErr } from '../../../lib/parsers/Result';
import { Listener } from '../../../lib/structures/Listener';
import { ChatInputCommandAcceptedPayload, Events } from '../../../lib/types/Events';

export class CoreListener extends Listener<typeof Events.ChatInputCommandAccepted> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.ChatInputCommandAccepted });
	}

	public async run(payload: ChatInputCommandAcceptedPayload) {
		const { command, context, interaction } = payload;

		const stopwatch = new Stopwatch();
		const result = await fromAsync(async () => {
			this.container.client.emit(Events.ChatInputCommandRun, interaction, command, { ...payload });
			const result = await command.chatInputRun(interaction, context);
			this.container.client.emit(Events.ChatInputCommandSuccess, { ...payload, result });
		});

		const { duration } = stopwatch.stop();
		if (isErr(result)) {
			this.container.client.emit(Events.ChatInputCommandError, result.error, { ...payload, duration });
		}

		this.container.client.emit(Events.ChatInputCommandFinish, interaction, command, { ...payload, duration });
	}
}
