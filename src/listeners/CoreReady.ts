import { Listener } from '../lib/structures/Listener';
import { Events } from '../lib/types/Events';
import { handleRegistryAPICalls } from '../lib/utils/application-commands/ApplicationCommandRegistries';

export class CoreEvent extends Listener {
	public constructor(context: Listener.Context) {
		super(context, { event: Events.ClientReady, once: true });
	}

	public async run() {
		this.container.client.id ??= this.container.client.user?.id ?? null;

		await handleRegistryAPICalls();
	}
}
