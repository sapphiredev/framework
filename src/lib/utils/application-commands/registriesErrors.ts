import { container } from '@sapphire/pieces';
import type { Command } from '../../structures/Command';
import { Events } from '../../types/Events';
import { bulkOverwriteError } from './registriesLog';

/**
 * Opinionatedly logs the encountered registry error.
 * @param error The emitted error
 * @param command The command which had the error
 */
export function emitPerRegistryError(error: unknown, command: Command<any, any>) {
	const { name, location } = command;
	const { client, logger } = container;

	if (client.listenerCount(Events.CommandApplicationCommandRegistryError)) {
		client.emit(Events.CommandApplicationCommandRegistryError, error, command);
	} else {
		logger.error(
			`Encountered error while handling the command application command registry for command "${name}" at path "${location.full}"`,
			error
		);
	}
}

/**
 * Opinionatedly logs any bulk overwrite registries error.
 * @param error The emitted error
 * @param guildId The guild id in which the error was caused
 */
export function emitBulkOverwriteError(error: unknown, guildId: string | null) {
	const { client } = container;

	if (client.listenerCount(Events.ApplicationCommandRegistriesBulkOverwriteError)) {
		client.emit(Events.ApplicationCommandRegistriesBulkOverwriteError, error, guildId);
	} else if (guildId) {
		bulkOverwriteError(`Failed to overwrite guild application commands for guild ${guildId}`, error);
	} else {
		bulkOverwriteError(`Failed to overwrite global application commands`, error);
	}
}
