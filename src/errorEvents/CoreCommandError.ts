import type { PieceContext } from '@sapphire/pieces';
import { UserError } from '../lib/errors/UserError';
import { Event } from '../lib/structures/Event';
import { CommandErrorPayload, Events } from '../lib/types/Events';

export class CoreEvent extends Event<Events.CommandError> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.CommandError });
	}

	public run(error: Error, context: CommandErrorPayload) {
		if (error instanceof UserError) return;
		const { name, path } = context.piece;
		this.context.logger.error(`Encountered error on command "${name}" at path "${path}"`, error.stack);
	}
}
