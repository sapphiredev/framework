/* eslint-disable @typescript-eslint/dot-notation */
import { container } from '@sapphire/pieces';
import { retry } from '@sapphire/utilities';
import type { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { ApplicationCommandType, type ApplicationCommandManager } from 'discord.js';
import type { Command } from '../../structures/Command';
import type { CommandStore } from '../../structures/CommandStore';
import { InternalRegistryAPIType, RegisterBehavior } from '../../types/Enums';
import { Events } from '../../types/Events';
import { ApplicationCommandRegistry } from './ApplicationCommandRegistry';
import { getNeededRegistryParameters } from './getNeededParameters';
import { emitBulkOverwriteError, emitPerRegistryError } from './registriesErrors';
import { bulkOverwriteDebug, bulkOverwriteInfo, bulkOverwriteWarn } from './registriesLog';

export let defaultBehaviorWhenNotIdentical = RegisterBehavior.Overwrite;
export let defaultGuildIds: ApplicationCommandRegistry.RegisterOptions['guildIds'] = undefined;
let bulkOVerwriteRetries = 1;

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

/**
 * Sets the default guild ids for registering commands. This is used when a command is registered _without_ providing
 * `guildIds` in that command's own {@link Command.registerApplicationCommands} method.
 * @param guildIds The default guildIds to set. Set this to `null` to reset it to the default
 * of `undefined`.
 */
export function setDefaultGuildIds(guildIds?: ApplicationCommandRegistry.RegisterOptions['guildIds'] | null) {
	defaultGuildIds = guildIds ?? undefined;
}

export function getDefaultGuildIds() {
	return defaultGuildIds;
}

/**
 * Sets the amount of retries for when registering commands, only applies when {@link defaultBehaviorWhenNotIdentical}
 * is set to {@link RegisterBehavior.BulkOverwrite}. This is used if registering the commands fails.
 * The default value is `1`, which means no retries are performed.
 * @param newAmountOfRetries The new amount of retries to set. Set this to `null` to reset it to the default
 */
export function setBulkOverwriteRetries(newAmountOfRetries: number | null) {
	bulkOVerwriteRetries = newAmountOfRetries ?? 1;
}

export function getBulkOverwriteRetries() {
	return bulkOVerwriteRetries;
}

export async function handleRegistryAPICalls() {
	container.client.emit(Events.ApplicationCommandRegistriesInitialising);

	const commandStore = container.stores.get('commands');

	for (const command of commandStore.values()) {
		if (command.registerApplicationCommands) {
			try {
				await command.registerApplicationCommands(command.applicationCommandRegistry);
			} catch (error) {
				emitPerRegistryError(error, command);
			}
		}
	}

	if (getDefaultBehaviorWhenNotIdentical() === RegisterBehavior.BulkOverwrite) {
		await handleBulkOverwrite(commandStore, container.client.application!.commands);
		return;
	}

	const params = await getNeededRegistryParameters(allGuildIdsToFetchCommandsFor);

	await handleAppendOrUpdate(commandStore, params);
}

export async function handleBulkOverwrite(commandStore: CommandStore, applicationCommands: ApplicationCommandManager) {
	const now = Date.now();

	// Map registries by guild, global, etc
	const foundGlobalCommands: BulkOverwriteData[] = [];
	const foundGuildCommands: Record<string, BulkOverwriteData[]> = {};

	// Collect all data
	for (const command of commandStore.values()) {
		const registry = command.applicationCommandRegistry;

		for (const call of registry['apiCalls']) {
			// Guild only cmd
			if (call.registerOptions.guildIds?.length) {
				for (const guildId of call.registerOptions.guildIds) {
					foundGuildCommands[guildId] ??= [];

					foundGuildCommands[guildId].push({ piece: command, data: call.builtData });
				}
				continue;
			}

			// Global command
			foundGlobalCommands.push({ piece: command, data: call.builtData });
		}
	}

	// Handle global commands
	await retry(() => handleBulkOverwriteGlobalCommands(commandStore, applicationCommands, foundGlobalCommands), bulkOVerwriteRetries);

	// Handle guild commands
	for (const [guildId, guildCommands] of Object.entries(foundGuildCommands)) {
		await retry(() => handleBulkOverwriteGuildCommands(commandStore, applicationCommands, guildId, guildCommands), bulkOVerwriteRetries);
	}

	container.client.emit(Events.ApplicationCommandRegistriesRegistered, registries, Date.now() - now);
}

async function handleBulkOverwriteGlobalCommands(
	commandStore: CommandStore,
	applicationCommands: ApplicationCommandManager,
	foundGlobalCommands: BulkOverwriteData[]
) {
	try {
		bulkOverwriteDebug(`Overwriting global application commands, now at ${foundGlobalCommands.length} commands`);
		const result = await applicationCommands.set(foundGlobalCommands.map((x) => x.data));

		// Go through each registered command, find its piece and alias it
		for (const [id, globalCommand] of result.entries()) {
			const piece = foundGlobalCommands.find((x) => x.data.name === globalCommand.name)?.piece;

			if (piece) {
				const registry = piece.applicationCommandRegistry;

				switch (globalCommand.type) {
					case ApplicationCommandType.ChatInput: {
						registry['handleIdAddition'](InternalRegistryAPIType.ChatInput, id);
						break;
					}
					case ApplicationCommandType.User:
					case ApplicationCommandType.Message: {
						registry['handleIdAddition'](InternalRegistryAPIType.ContextMenu, id);
						break;
					}
				}

				// idHints are useless, and any manually added id or names could end up not being valid any longer if you use bulk overwrites
				// That said, this might be an issue, so we might need to do it like `handleAppendOrUpdate`
				commandStore.aliases.set(id, piece);
			} else {
				bulkOverwriteWarn(
					`Registered global command "${globalCommand.name}" (${id}) but failed to find the piece in the command store. This should not happen`
				);
			}
		}

		bulkOverwriteInfo(`Successfully overwrote global application commands. The application now has ${result.size} global commands`);
	} catch (error) {
		emitBulkOverwriteError(error, null);
	}
}

async function handleBulkOverwriteGuildCommands(
	commandStore: CommandStore,
	applicationCommands: ApplicationCommandManager,
	guildId: string,
	guildCommands: BulkOverwriteData[]
) {
	try {
		bulkOverwriteDebug(`Overwriting guild application commands for guild ${guildId}, now at ${guildCommands.length} commands`);
		const result = await applicationCommands.set(
			guildCommands.map((x) => x.data),
			guildId
		);

		// Go through each registered command, find its piece and alias it
		for (const [id, guildCommand] of result.entries()) {
			// I really hope nobody has a guild command with the same name as another command -.-
			// Not like they could anyways as Discord would throw an error for duplicate names
			// But yknow... If you're reading this and you did this... Why?
			const piece = guildCommands.find((x) => x.data.name === guildCommand.name)?.piece;

			if (piece) {
				const registry = piece.applicationCommandRegistry;

				switch (guildCommand.type) {
					case ApplicationCommandType.ChatInput: {
						registry['handleIdAddition'](InternalRegistryAPIType.ChatInput, id, guildId);
						break;
					}
					case ApplicationCommandType.User:
					case ApplicationCommandType.Message: {
						registry['handleIdAddition'](InternalRegistryAPIType.ContextMenu, id, guildId);
						break;
					}
				}

				// idHints are useless, and any manually added ids or names could no longer be valid if you use bulk overwrites.
				// That said, this might be an issue, so we might need to do it like `handleAppendOrUpdate`
				commandStore.aliases.set(id, piece);
			} else {
				bulkOverwriteWarn(
					`Registered guild command "${guildCommand.name}" (${id}) but failed to find the piece in the command store. This should not happen`
				);
			}
		}

		bulkOverwriteInfo(
			`Successfully overwrote guild application commands for guild ${guildId}. The application now has ${result.size} guild commands for guild ${guildId}`
		);
	} catch (error) {
		emitBulkOverwriteError(error, guildId);
	}
}

async function handleAppendOrUpdate(
	commandStore: CommandStore,
	{ applicationCommands, globalCommands, guildCommands }: Awaited<ReturnType<typeof getNeededRegistryParameters>>
) {
	const now = Date.now();

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

	container.client.emit(Events.ApplicationCommandRegistriesRegistered, registries, Date.now() - now);
}

interface BulkOverwriteData {
	piece: Command;
	data: RESTPostAPIApplicationCommandsJSONBody;
}
