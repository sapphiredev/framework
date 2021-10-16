import type { PieceContext } from '@sapphire/pieces';
import { Listener } from '../lib/structures/Listener';
import { CommandErrorPayload, Events } from '../lib/types/Events';

export class CoreEvent extends Listener<typeof Events.CommandError> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.CommandError });
	}

	public run(error: unknown, context: CommandErrorPayload) {
		const { name, location } = context.piece;
		this.container.logger.error(`Encountered error on command "${name}" at path "${location.full}"`, error);
	}
}
