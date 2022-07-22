import type { PieceContext } from '@sapphire/pieces';
import { Listener } from '../../../lib/structures/Listener';
import { Events, PreContextMenuCommandRunPayload } from '../../../lib/types/Events';

export class CoreListener extends Listener<typeof Events.PreContextMenuCommandRun> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.PreContextMenuCommandRun });
	}

	public async run(payload: PreContextMenuCommandRunPayload) {
		const { command, interaction } = payload;

		// Run global preconditions:
		const globalResult = await this.container.stores.get('preconditions').contextMenuRun(interaction, command, payload as any);
		if (!globalResult.isErr()) {
			this.container.client.emit(Events.ContextMenuCommandDenied, globalResult.unwrapErr(), payload);
			return;
		}

		// Run command-specific preconditions:
		const localResult = await command.preconditions.contextMenuRun(interaction, command, payload as any);
		if (!localResult.isErr()) {
			this.container.client.emit(Events.ContextMenuCommandDenied, localResult.unwrapErr(), payload);
			return;
		}

		this.container.client.emit(Events.ContextMenuCommandAccepted, payload);
	}
}
