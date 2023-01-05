import { container } from '@sapphire/pieces';
import { RegisterBehavior } from '../../types/Enums';
import { Events } from '../../types/Events';
import { ApplicationCommandRegistry } from './ApplicationCommandRegistry';
import { emitRegistryError } from './emitRegistryError';
import { getNeededRegistryParameters } from './getNeededParameters';

export let defaultBehaviorWhenNotIdentical = RegisterBehavior.Overwrite;

export const registries = new Map<string, ApplicationCommandRegistry>();

export const allGuildIdsToFetchCommandsFor = new Set<string>();

/**
 * Acquires a registry for a command by its name.
 * @param commandName The name of the command.
 * @returns The application command registry for the command
 */
export function acquire(commandName: string) {
	const existing = registries.get(commandName);
	if (existing) {
		return existing;
	}

	const newRegistry = new ApplicationCommandRegistry(commandName);
	registries.set(commandName, newRegistry);

	return newRegistry;
}

/**
 * Sets the default behavior when registered commands aren't identical to provided data.
 * @param behavior The default behavior to have. Set this to `null` to reset it to the default
 * of `RegisterBehavior.Overwrite`.
 */
export function setDefaultBehaviorWhenNotIdentical(behavior?: RegisterBehavior | null) {
	defaultBehaviorWhenNotIdentical = behavior ?? RegisterBehavior.Overwrite;
}

export function getDefaultBehaviorWhenNotIdentical() {
	return defaultBehaviorWhenNotIdentical;
}

export async function handleRegistryAPICalls() {
	const commandStore = container.stores.get('commands');

	for (const command of commandStore.values()) {
		if (command.registerApplicationCommands) {
			try {
				await command.registerApplicationCommands(command.applicationCommandRegistry);
			} catch (error) {
				emitRegistryError(error, command);
			}
		}
	}

	const { applicationCommands, globalCommands, guildCommands } = await getNeededRegistryParameters(allGuildIdsToFetchCommandsFor);

	for (const registry of registries.values()) {
		// eslint-disable-next-line @typescript-eslint/dot-notation
		await registry['runAPICalls'](applicationCommands, globalCommands, guildCommands);

		const piece = registry.command;

		if (piece) {
			for (const nameOrId of piece.applicationCommandRegistry.chatInputCommands) {
				commandStore.aliases.set(nameOrId, piece);
			}

			for (const nameOrId of piece.applicationCommandRegistry.contextMenuCommands) {
				commandStore.aliases.set(nameOrId, piece);
			}
		}
	}

	container.client.emit(Events.ApplicationCommandRegistriesRegistered, registries);
}
