import { AliasStore } from '@sapphire/pieces';
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
}
