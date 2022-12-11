import { Listener } from '../../lib/structures/Listener';
import { Events } from '../../lib/types/Events';

export class CoreEvent extends Listener {
	public constructor(context: Listener.Context) {
		super(context, { name: 'CoreReadyUnknownCommand', event: Events.ClientReady, once: true });
	}

	public async run() {
		const commands = await this.container.client.application?.commands.fetch();
		const store = this.container.stores.get('commands');
		if (!commands) return;
		const commandsToDelete = commands.filter((command) => !store.has(command.name));

		for (const command of commandsToDelete.values()) {
			await this.container.client.application?.commands.delete(command);
		}
	}
}
