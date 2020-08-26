import type { PieceContext } from '@sapphire/pieces';
import { Event, EventOptions } from '../lib/structures/Event';
import { Events } from '../lib/types/Events';

export class CoreEvent extends Event<Events.Ready> {
	public constructor(context: PieceContext, options: EventOptions = {}) {
		super(context, { ...options, event: Events.Ready, once: true });
	}

	public run() {
		if (!this.client.id) this.client.id = this.client.user?.id ?? null;
	}
}
