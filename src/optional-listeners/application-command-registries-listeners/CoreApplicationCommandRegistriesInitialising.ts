import { Listener } from '../../lib/structures/Listener';
import { Events } from '../../lib/types/Events';

export class CoreListener extends Listener<typeof Events.ApplicationCommandRegistriesInitialising> {
	public constructor(context: Listener.Context) {
		super(context, { event: Events.ApplicationCommandRegistriesInitialising, once: true });
	}

	public run() {
		this.container.logger.info('ApplicationCommandRegistries: Initializing...');
	}
}
