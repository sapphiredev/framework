import type { PieceContext } from '@sapphire/pieces';
import type { Command } from '../../lib/structures/Command';
import { Listener } from '../../lib/structures/Listener';
import { SapphireEvents } from '../../lib/types/Events';

export class CoreEvent extends Listener<typeof SapphireEvents.CommandApplicationCommandRegistryError> {
	public constructor(context: PieceContext) {
		super(context, { event: SapphireEvents.CommandApplicationCommandRegistryError });
	}

	public run(error: unknown, command: Command) {
		const { name, location } = command;
		this.container.logger.error(
			`Encountered error while handling the command application command registry for command "${name}" at path "${location.full}"`,
			error
		);
	}
}
