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
	const { client } = container;

	const applicationCommands = client.application!.commands;
	const globalCommands = await applicationCommands.fetch();
	const guildCommands = await fetchGuildCommands(applicationCommands);

	for (const registry of registries.values()) {
		// eslint-disable-next-line @typescript-eslint/dot-notation
		await registry['runAPICalls'](applicationCommands, globalCommands, guildCommands);
	}
}

async function fetchGuildCommands(commands: ApplicationCommandManager) {
	const map = new Map<string, Collection<string, ApplicationCommand>>();

	for (const guildId of commands.client.guilds.cache.keys()) {
		const guildCommands = await commands.fetch({ guildId });
		map.set(guildId, guildCommands);
	}

	return map;
}
