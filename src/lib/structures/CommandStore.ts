import { AliasStore } from '@sapphire/pieces';
import { Events } from '../types/Events';
import { getNeededRegistryParameters } from '../utils/application-commands/getNeededParameters';
import { Command } from './Command';

/**
 * Stores all Command pieces
 * @since 1.0.0
 */
export class CommandStore extends AliasStore<Command> {
	public constructor() {
		super(Command as any, { name: 'commands' });
	}

	/**
	 * Get all the command categories.
	 */
	public get categories(): string[] {
		const categories = new Set(this.map((command) => command.category));
		categories.delete(null);
		return [...categories] as string[];
	}

	public override async insert(piece: Command) {
		try {
			await piece.registerApplicationCommands(piece.applicationCommandRegistry);
		} catch (error) {
			this.container.client.emit(Events.CommandApplicationCommandRegistryError, error, piece);
		}

		return super.insert(piece);
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

		// Reset the registry's contents
		piece.applicationCommandRegistry.chatInputCommands.clear();
		piece.applicationCommandRegistry.contextMenuCommands.clear();
		piece.applicationCommandRegistry['apiCalls'].length = 0;

		return super.unload(name);
	}

	public override async loadAll() {
		await super.loadAll();

		const { applicationCommands, globalCommands, guildCommands } = await getNeededRegistryParameters();

		for (const command of this.values()) {
			// eslint-disable-next-line @typescript-eslint/dot-notation
			await command.applicationCommandRegistry['runAPICalls'](applicationCommands, globalCommands, guildCommands);

			// Re-set the aliases
			for (const nameOrId of command.applicationCommandRegistry.chatInputCommands) {
				this.aliases.set(nameOrId, command);
			}

			for (const nameOrId of command.applicationCommandRegistry.contextMenuCommands) {
				this.aliases.set(nameOrId, command);
			}
		}
	}
}
