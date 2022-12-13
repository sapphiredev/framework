import { Listener } from '../../lib/structures/Listener';
import { Events } from '../../lib/types/Events';

export class CoreEvent extends Listener {
	public constructor(context: Listener.Context) {
		super(context, { name: 'CoreReadyUnknownCommand', event: Events.ClientReady, once: true });
	}

	public async run() {
		const commands = await this.container.client.application?.commands.fetch();
		if (!commands) {
			return;
		}
		this.container.logger.debug(`Fetched all Application Commands for the currently logged in client`);
		const store = this.container.stores.get('commands');
		if (!store) {
			return;
		}
		const commandsToDelete = commands.filter((command) => !store.has(command.name));

		for (const command of commandsToDelete.values()) {
			this.container.logger.debug(`Deleting application command ${command.name} (${command.id})`);
			await this.container.client.application?.commands.delete(command);
		}
	}
}
