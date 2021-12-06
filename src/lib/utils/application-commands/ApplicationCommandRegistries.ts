import { container } from '@sapphire/pieces';
import type { ApplicationCommand, ApplicationCommandManager, Collection } from 'discord.js';
import { ApplicationCommandRegistry } from './ApplicationCommandRegistry';

export const registries = new Map<string, ApplicationCommandRegistry>();

export function acquire(commandName: string) {
	const existing = registries.get(commandName);
	if (existing) {
		return existing;
	}

	const newRegistry = new ApplicationCommandRegistry(commandName);
	registries.set(commandName, newRegistry);

	return newRegistry;
}

export async function handleRegistryAPICalls() {
	const { client, stores } = container;
	const commandStore = stores.get('commands');

	const applicationCommands = client.application!.commands;
	const globalCommands = await applicationCommands.fetch();
	const guildCommands = await fetchGuildCommands(applicationCommands);

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
}

async function fetchGuildCommands(commands: ApplicationCommandManager) {
	const map = new Map<string, Collection<string, ApplicationCommand>>();

	for (const [guildId, guild] of commands.client.guilds.cache.entries()) {
		try {
			const guildCommands = await commands.fetch({ guildId });
			map.set(guildId, guildCommands);
		} catch (err) {
			container.logger.warn(
				`ApplicationCommandRegistries: Failed to fetch guild commands for guild "${guild.name}" (${guildId}).`,
				'Make sure to authorize your application with the "applications.commands" scope in that guild,.'
			);
		}
	}

	return map;
}
