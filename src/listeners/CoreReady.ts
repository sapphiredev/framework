import type { PieceContext } from '@sapphire/pieces';
import { Listener } from '../lib/structures/Listener';
import { Events } from '../lib/types/Events';

export class CoreEvent extends Listener<typeof Events.ClientReady> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.ClientReady, once: true });
	}

	public run() {
		this.container.client.id ??= this.container.client.user?.id ?? null;
		// TODO: Commands.forEach(it.commandRegistry.run())
	}
}
