import { container } from '@sapphire/pieces';
import type { ApplicationCommand, ApplicationCommandManager, Collection } from 'discord.js';

export async function getNeededRegistryParameters() {
	const { client } = container;

	const applicationCommands = client.application!.commands;
	const globalCommands = await applicationCommands.fetch({ withLocalizations: true });
	const guildCommands = await fetchGuildCommands(applicationCommands);

	return {
		applicationCommands,
		globalCommands,
		guildCommands
	};
}

async function fetchGuildCommands(commands: ApplicationCommandManager) {
	const map = new Map<string, Collection<string, ApplicationCommand>>();

	for (const [guildId, guild] of commands.client.guilds.cache.entries()) {
		try {
			const guildCommands = await commands.fetch({ guildId, withLocalizations: true });
			map.set(guildId, guildCommands);
		} catch (err) {
			const { preventFailedToFetchLogForGuilds } = container.client.options;

			if (preventFailedToFetchLogForGuilds === true) continue;

			if (Array.isArray(preventFailedToFetchLogForGuilds) && !preventFailedToFetchLogForGuilds?.includes(guildId)) {
				container.logger.warn(
					`ApplicationCommandRegistries: Failed to fetch guild commands for guild "${guild.name}" (${guildId}).`,
					'Make sure to authorize your application with the "applications.commands" scope in that guild.'
				);
			}
		}
	}

	return map;
}
