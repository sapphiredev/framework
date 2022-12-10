import { Listener } from '../../lib/structures/Listener';
import { Events } from '../../lib/types/Events';

export class CoreEvent extends Listener {
	public constructor(context: Listener.Context) {
		super(context, { name: 'CoreReadyUnknownCommand', event: Events.ClientReady, once: true });
	}

	public async run() {
		const clientCommands = await this.container.client.application?.commands.fetch();
		if (!clientCommands) return;
		const storedCommands = new Set(this.container.stores.get('commands').keys());
		const commandsToDelete = clientCommands.filter((command) => !storedCommands.has(command.name));

		for (const command of commandsToDelete.values()) {
			await this.container.client.application?.commands.delete(command);
		}
	}
}
