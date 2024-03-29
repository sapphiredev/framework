import type { Command } from '../../lib/structures/Command';
import { Listener } from '../../lib/structures/Listener';
import { Events } from '../../lib/types/Events';

export class CoreListener extends Listener<typeof Events.CommandApplicationCommandRegistryError> {
	public constructor(context: Listener.LoaderContext) {
		super(context, { event: Events.CommandApplicationCommandRegistryError });
	}

	public run(error: unknown, command: Command) {
		const { name, location } = command;
		this.container.logger.error(
			`Encountered error while handling the command application command registry for command "${name}" at path "${location.full}"`,
			error
		);
	}
}
