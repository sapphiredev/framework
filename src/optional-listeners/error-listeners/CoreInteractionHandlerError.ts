import type { PieceContext } from '@sapphire/pieces';
import { Listener } from '../../lib/structures/Listener';
import { SapphireEvents, InteractionHandlerError } from '../../lib/types/Events';

export class CoreEvent extends Listener<typeof SapphireEvents.InteractionHandlerError> {
	public constructor(context: PieceContext) {
		super(context, { event: SapphireEvents.InteractionHandlerError });
	}

	public run(error: unknown, context: InteractionHandlerError) {
		const { name, location } = context.handler;
		this.container.logger.error(
			`Encountered error while handling an interaction handler run method for interaction-handler "${name}" at path "${location.full}"`,
			error
		);
	}
}
