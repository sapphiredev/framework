import type { PieceContext } from '@sapphire/pieces';
import { Listener } from '../../../lib/structures/Listener';
import { SapphireEvents, PreContextMenuCommandRunPayload } from '../../../lib/types/Events';

export class CoreListener extends Listener<typeof SapphireEvents.PreContextMenuCommandRun> {
	public constructor(context: PieceContext) {
		super(context, { event: SapphireEvents.PreContextMenuCommandRun });
	}

	public async run(payload: PreContextMenuCommandRunPayload) {
		const { command, interaction } = payload;

		// Run global preconditions:
		const globalResult = await this.container.stores.get('preconditions').contextMenuRun(interaction, command, payload as any);
		if (!globalResult.success) {
			this.container.client.emit(SapphireEvents.ContextMenuCommandDenied, globalResult.error, payload);
			return;
		}

		// Run command-specific preconditions:
		const localResult = await command.preconditions.contextMenuRun(interaction, command, payload as any);
		if (!localResult.success) {
			this.container.client.emit(SapphireEvents.ContextMenuCommandDenied, localResult.error, payload);
			return;
		}

		this.container.client.emit(SapphireEvents.ContextMenuCommandAccepted, payload);
	}
}
