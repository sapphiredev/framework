import type { Message } from 'discord.js';
import type { UserError } from '../../errors/UserError';
import type { Command } from '../../structures/Command';
import { isErr, ok, Result } from '../Result';
import { PreconditionContainerAny } from './PreconditionContainerAny';

export class PreconditionContainerAll extends PreconditionContainerAny {
	protected async runSequential(message: Message, command: Command): Promise<Result<unknown, UserError>> {
		for (const child of this.entries) {
			const result = await child.run(message, command);
			if (isErr(result)) return result;
		}

		return ok();
	}

	protected async runParallel(message: Message, command: Command): Promise<Result<unknown, UserError>> {
		const results = await Promise.all(this.entries.map((entry) => entry.run(message, command)));
		// This is simplified compared to PreconditionContainerAny because we're looking for the first error.
		// However, the base implementation short-circuits with the first Ok.
		return results.find(isErr) ?? ok();
	}
}
