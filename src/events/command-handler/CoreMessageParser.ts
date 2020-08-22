import type { PieceContext } from '@sapphire/pieces';
import { Event } from '../../lib/structures/Event';
// import type { Message } from 'discord.js';

export class CoreEvent extends Event {
	public constructor(context: PieceContext) {
		super(context, { event: 'message' });
	}

	public run(/* message: Message */) {
		// TODO: Handle command.
	}
}
