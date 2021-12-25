import type { PieceContext } from '@sapphire/pieces';
import { fromAsync, isErr } from '../../../lib/parsers/Result';
import { Listener } from '../../../lib/structures/Listener';
import { ContextMenuCommandAcceptedPayload, Events } from '../../../lib/types/Events';

export class CoreListener extends Listener<typeof Events.ContextMenuCommandAccepted> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.ContextMenuCommandAccepted });
	}

	public async run(payload: ContextMenuCommandAcceptedPayload) {
		const { command, context, interaction } = payload;

		const result = await fromAsync(async () => {
			this.container.client.emit(Events.ContextMenuCommandRun, interaction, command, { ...payload });
			const result = await command.contextMenuRun(interaction, context);
			this.container.client.emit(Events.ContextMenuCommandSuccess, { ...payload, result });
		});

		if (isErr(result)) {
			this.container.client.emit(Events.ContextMenuCommandError, result.error, { ...payload });
		}

		this.container.client.emit(Events.ContextMenuCommandFinish, interaction, command, { ...payload });
	}
}
