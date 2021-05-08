import type { PieceContext } from '@sapphire/pieces';
import { Event } from '../lib/structures/Event';
import { CommandErrorPayload, Events } from '../lib/types/Events';

export class CoreEvent extends Event<Events.CommandError> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.CommandError });
	}

	public run(error: Error, context: CommandErrorPayload) {
		const { name, path } = context.piece;
		this.container.logger.error(`Encountered error on command "${name}" at path "${path}"`, error);
	}
}
