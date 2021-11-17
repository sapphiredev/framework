import type { PieceContext } from '@sapphire/pieces';
import { Listener } from '../lib/structures/Listener';
import { Events } from '../lib/types/Events';
import { handleRegistryAPICalls } from '../lib/utils/application-commands/ApplicationCommandRegistries';

export class CoreEvent extends Listener<typeof Events.ClientReady> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.ClientReady, once: true });
	}

	public async run() {
		this.container.client.id ??= this.container.client.user?.id ?? null;

		const now = Date.now();
		await handleRegistryAPICalls();
		const diff = Date.now() - now;

		this.container.logger.debug(`ApplicationCommandRegistries: Took ${diff.toLocaleString()}ms to initialize.`);
	}
}
