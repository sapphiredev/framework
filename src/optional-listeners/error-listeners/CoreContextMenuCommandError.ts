import type { PieceContext } from '@sapphire/pieces';
import { Listener } from '../../lib/structures/Listener';
import { ContextMenuCommandErrorPayload, SapphireEvents } from '../../lib/types/Events';

export class CoreEvent extends Listener<typeof SapphireEvents.ContextMenuCommandError> {
	public constructor(context: PieceContext) {
		super(context, { event: SapphireEvents.ContextMenuCommandError });
	}

	public run(error: unknown, context: ContextMenuCommandErrorPayload) {
		const { name, location } = context.command;
		this.container.logger.error(`Encountered error on message command "${name}" at path "${location.full}"`, error);
	}
}
