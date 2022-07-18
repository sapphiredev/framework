import { container } from '@sapphire/pieces';
import type { Command } from '../../structures/Command';
import { SapphireEvents } from '../../types/Events';

/**
 * Opinionatedly logs the encountered registry error.
 * @param error The emitted error
 * @param command The command which had the error
 */
export function emitRegistryError(error: unknown, command: Command<any, any>) {
	const { name, location } = command;
	const { client, logger } = container;

	if (client.listenerCount(SapphireEvents.CommandApplicationCommandRegistryError)) {
		client.emit(SapphireEvents.CommandApplicationCommandRegistryError, error, command);
	} else {
		logger.error(
			`Encountered error while handling the command application command registry for command "${name}" at path "${location.full}"`,
			error
		);
	}
}
