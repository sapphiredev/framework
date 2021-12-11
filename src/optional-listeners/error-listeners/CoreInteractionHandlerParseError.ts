import type { PieceContext } from '@sapphire/pieces';
import { Listener } from '../../lib/structures/Listener';
import { Events, InteractionHandlerParseError as InteractionHandlerParseErrorPayload } from '../../lib/types/Events';

export class CoreEvent extends Listener<typeof Events.InteractionHandlerParseError> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.InteractionHandlerParseError });
	}

	public run(error: unknown, context: InteractionHandlerParseErrorPayload) {
		const { name, location } = context.handler;
		this.container.logger.error(
			`Encountered error while handling an interaction handler parse method for interaction-handler "${name}" at path "${location.full}"`,
			error
		);
	}
}
