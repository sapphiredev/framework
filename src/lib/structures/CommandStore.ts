import { AliasStore } from '@sapphire/pieces';
import { Events } from '../types/Events';
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

		for (const nameOrId of piece.applicationCommandRegistry.chatInputCommands) {
			this.aliases.set(nameOrId, piece);
		}

		for (const nameOrId of piece.applicationCommandRegistry.contextMenuCommands) {
			this.aliases.set(nameOrId, piece);
		}

		return super.insert(piece);
	}

	public override unload(name: string | Command) {
		const piece = this.resolve(name);

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

		return super.unload(name);
	}
}
