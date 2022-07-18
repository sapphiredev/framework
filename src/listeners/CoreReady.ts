import type { PieceContext } from '@sapphire/pieces';
import { Listener } from '../lib/structures/Listener';
import { SapphireEvents } from '../lib/types/Events';
import { handleRegistryAPICalls } from '../lib/utils/application-commands/ApplicationCommandRegistries';

export class CoreEvent extends Listener {
	public constructor(context: PieceContext) {
		super(context, { event: SapphireEvents.ClientReady, once: true });
	}

	public async run() {
		this.container.client.id ??= this.container.client.user?.id ?? null;

		this.container.logger.info(`ApplicationCommandRegistries: Initializing...`);

		const now = Date.now();
		await handleRegistryAPICalls();
		const diff = Date.now() - now;

		this.container.logger.info(`ApplicationCommandRegistries: Took ${diff.toLocaleString()}ms to initialize.`);
	}
}
