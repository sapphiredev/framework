import { AliasStore } from '@sapphire/pieces';
import { RegisterBehavior } from '../types/Enums';
import {
	allGuildIdsToFetchCommandsFor,
	getDefaultBehaviorWhenNotIdentical,
	handleBulkOverwrite,
	registries
} from '../utils/application-commands/ApplicationCommandRegistries';
import { emitRegistryError } from '../utils/application-commands/emitRegistryError';
import { getNeededRegistryParameters } from '../utils/application-commands/getNeededParameters';
import { Command } from './Command';

/**
 * Stores all Command pieces
 * @since 1.0.0
 */
export class CommandStore extends AliasStore<Command> {
	public constructor() {
		super(Command, { name: 'commands' });
	}

	/**
	 * Get all the command categories.
	 */
	public get categories(): string[] {
		const categories = new Set(this.map((command) => command.category));
		categories.delete(null);
		return [...categories] as string[];
	}

	public override unload(name: string | Command) {
		const piece = this.resolve(name);

		// Remove the aliases from the store
		for (const nameOrId of piece.applicationCommandRegistry.chatInputCommands) {
			const aliasedPiece = this.aliases.get(nameOrId);
			if (aliasedPiece === piece) {
				this.aliases.delete(nameOrId);
			}
		}

		for (const nameOrId of piece.applicationCommandRegistry.contextMenuCommands) {
			const aliasedPiece = this.aliases.get(nameOrId);
			if (aliasedPiece === piece) {
				this.aliases.delete(nameOrId);
			}
		}

		// Remove the registry from the application command registries
		registries.delete(piece.name);

		return super.unload(name);
	}

	public override async loadAll() {
		await super.loadAll();

		// If we don't have an application, that means this was called on login...
		if (!this.container.client.application) return;

		// super.loadAll() currently deletes all application command registries while unloading old pieces,
		// re-register application commands to ensure allGuildIdsToFetchCommandsFor has new guild ids for getNeededRegistryParameters
		for (const command of this.values()) {
			if (command.registerApplicationCommands) {
				try {
					await command.registerApplicationCommands(command.applicationCommandRegistry);
				} catch (error) {
					emitRegistryError(error, command);
				}
			}
		}

		// If the default behavior is set to bulk overwrite, handle it as such and return.
		if (getDefaultBehaviorWhenNotIdentical() === RegisterBehavior.BulkOverwrite) {
			await handleBulkOverwrite(this, this.container.client.application.commands);
			return;
		}

		const { applicationCommands, globalCommands, guildCommands } = await getNeededRegistryParameters(allGuildIdsToFetchCommandsFor);

		for (const command of this.values()) {
			// eslint-disable-next-line @typescript-eslint/dot-notation
			await command.applicationCommandRegistry['runAPICalls'](applicationCommands, globalCommands, guildCommands);

			// Reinitialize the aliases
			for (const nameOrId of command.applicationCommandRegistry.chatInputCommands) {
				this.aliases.set(nameOrId, command);
			}

			for (const nameOrId of command.applicationCommandRegistry.contextMenuCommands) {
				this.aliases.set(nameOrId, command);
			}
		}
	}
}
