import { Listener } from '../../lib/structures/Listener';
import { Events } from '../../lib/types/Events';
import type { ApplicationCommandRegistry } from '../../lib/utils/application-commands/ApplicationCommandRegistry';

export class CoreListener extends Listener<typeof Events.ApplicationCommandRegistriesRegistered> {
	public constructor(context: Listener.Context) {
		super(context, { event: Events.ApplicationCommandRegistriesRegistered, once: true });
	}

	public run(_registries: Map<string, ApplicationCommandRegistry>, timeTaken: number) {
		this.container.logger.info(`ApplicationCommandRegistries: Took ${timeTaken.toLocaleString()}ms to initialize.`);
	}
}
