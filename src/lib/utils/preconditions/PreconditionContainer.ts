import { PreconditionContainerAny } from './PreconditionContainerAny';
import type { Command } from '../../structures/Command';
import type { Message } from 'discord.js';

export class PreconditionContainerAll extends PreconditionContainerAny {
	protected async runSequential(message: Message, command: Command) {
		for (const child of this.entries) {
			if (!(await child.run(message, command))) return false;
		}

		return true;
	}

	protected async runParallel(message: Message, command: Command) {
		const results = await Promise.all(this.entries.map((entry) => entry.run(message, command)));
		return results.every((result) => result);
	}
}
