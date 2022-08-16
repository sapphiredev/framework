import type { PieceContext } from '@sapphire/pieces';
import type { CommandInteraction, ContextMenuInteraction, Message } from 'discord.js';
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

	public chatInputRun(_: CommandInteraction, command: Command, context: AllFlowsPrecondition.Context): AllFlowsPrecondition.Result {
		return command.enabled
			? this.ok()
			: this.error({ identifier: Identifiers.CommandDisabled, message: 'This chat input command is disabled.', context });
	}

	public contextMenuRun(_: ContextMenuInteraction, command: Command, context: AllFlowsPrecondition.Context): AllFlowsPrecondition.Result {
		return command.enabled
			? this.ok()
			: this.error({ identifier: Identifiers.CommandDisabled, message: 'This context menu command is disabled.', context });
	}
}
