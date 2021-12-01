import type { PieceContext } from '@sapphire/pieces';
import { Listener } from '../../../lib/structures/Listener';
import { Events, PreChatInputCommandRunPayload } from '../../../lib/types/Events';

export class CoreListener extends Listener<typeof Events.PreChatInputCommandRun> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.PreChatInputCommandRun });
	}

	public async run(payload: PreChatInputCommandRunPayload) {
		const { command, interaction } = payload;

		// Run global preconditions:
		const globalResult = await this.container.stores.get('preconditions').chatInputRun(interaction, command, payload as any);
		if (!globalResult.success) {
			this.container.client.emit(Events.ChatInputCommandDenied, globalResult.error, payload);
			return;
		}

		// Run command-specific preconditions:
		const localResult = await command.preconditions.chatInputRun(interaction, command, payload as any);
		if (!localResult.success) {
			this.container.client.emit(Events.ChatInputCommandDenied, localResult.error, payload);
			return;
		}

		this.container.client.emit(Events.ChatInputCommandAccepted, payload);
	}
}
