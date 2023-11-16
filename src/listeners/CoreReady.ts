import { container } from '@sapphire/pieces';
import { Listener } from '../lib/structures/Listener';
import { Events } from '../lib/types/Events';
import { handleRegistryAPICalls } from '../lib/utils/application-commands/ApplicationCommandRegistries';

export class CoreListener extends Listener {
	public constructor(context: Listener.LoaderContext) {
		super(context, { event: Events.ClientReady, once: true });
	}

	public async run() {
		this.container.client.id ??= this.container.client.user?.id ?? null;

		await handleRegistryAPICalls();
	}
}

void container.stores.loadPiece({
	name: 'CoreInteractionCreate',
	piece: CoreListener,
	store: 'listeners'
});
