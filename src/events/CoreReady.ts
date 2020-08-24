import type { PieceContext } from '@sapphire/pieces';
import { Event } from '../lib/structures/Event';
import { Events } from '../lib/types/Events';

export class CoreEvent extends Event<Events.Ready> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.Ready });
	}

	public run() {
		if (!this.client.id) this.client.id = this.client.user?.id ?? null;
	}
}
