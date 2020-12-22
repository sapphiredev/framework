import type { PieceContext } from '@sapphire/pieces';
import { Event } from '../lib/structures/Event';
import { Events } from '../lib/types/Events';

export class CoreEvent extends Event<Events.Ready> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.Ready, once: true });
	}

	public run() {
		this.context.client.id ??= this.context.client.user?.id ?? null;
	}
}
