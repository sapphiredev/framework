import type { PieceContext } from '@sapphire/pieces';
import { fromAsync, isErr } from '@sapphire/result';
import { Stopwatch } from '@sapphire/stopwatch';
import { Listener } from '../../../lib/structures/Listener';
import { ContextMenuCommandAcceptedPayload, SapphireEvents } from '../../../lib/types/Events';

export class CoreListener extends Listener<typeof SapphireEvents.ContextMenuCommandAccepted> {
	public constructor(context: PieceContext) {
		super(context, { event: SapphireEvents.ContextMenuCommandAccepted });
	}

	public async run(payload: ContextMenuCommandAcceptedPayload) {
		const { command, context, interaction } = payload;

		const result = await fromAsync(async () => {
			this.container.client.emit(SapphireEvents.ContextMenuCommandRun, interaction, command, { ...payload });

			const stopwatch = new Stopwatch();
			const result = await command.contextMenuRun(interaction, context);
			const { duration } = stopwatch.stop();

			this.container.client.emit(SapphireEvents.ContextMenuCommandSuccess, { ...payload, result, duration });

			return duration;
		});

		if (isErr(result)) {
			this.container.client.emit(SapphireEvents.ContextMenuCommandError, result.error, { ...payload, duration: result.value ?? -1 });
		}

		this.container.client.emit(SapphireEvents.ContextMenuCommandFinish, interaction, command, {
			...payload,
			success: !isErr(result),
			duration: result.value ?? -1
		});
	}
}
