import { container, type PieceContext } from '@sapphire/pieces';
import type { ChatInputCommandInteraction, ContextMenuCommandInteraction, Message } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import type { Command } from '../lib/structures/Command';
import { AllFlowsPrecondition } from '../lib/structures/Precondition';

export class CorePrecondition extends AllFlowsPrecondition {
	public constructor(context: PieceContext) {
		super(context, { position: 10 });
	}

	public messageRun(_: Message, command: Command, context: AllFlowsPrecondition.Context): AllFlowsPrecondition.Result {
		return command.enabled
			? this.ok()
			: this.error({ identifier: Identifiers.CommandDisabled, message: 'This message command is disabled.', context });
	}

	public chatInputRun(_: ChatInputCommandInteraction, command: Command, context: AllFlowsPrecondition.Context): AllFlowsPrecondition.Result {
		return command.enabled
			? this.ok()
			: this.error({ identifier: Identifiers.CommandDisabled, message: 'This chat input command is disabled.', context });
	}

	public contextMenuRun(_: ContextMenuCommandInteraction, command: Command, context: AllFlowsPrecondition.Context): AllFlowsPrecondition.Result {
		return command.enabled
			? this.ok()
			: this.error({ identifier: Identifiers.CommandDisabled, message: 'This context menu command is disabled.', context });
	}
}

void container.stores.loadPiece({
	name: 'Enabled',
	piece: CorePrecondition,
	store: 'preconditions'
});
