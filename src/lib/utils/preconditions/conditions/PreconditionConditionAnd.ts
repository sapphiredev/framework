import { Result } from '@sapphire/result';
import type { IPreconditionCondition } from './IPreconditionCondition';

/**
 * An {@link IPreconditionCondition} which runs all containers similarly to doing (V0 && V1 [&& V2 [&& V3 ...]]).
 * @since 1.0.0
 */
export const PreconditionConditionAnd: IPreconditionCondition = {
	async messageSequential(message, command, entries, context) {
		for (const child of entries) {
			const result = await child.messageRun(message, command, context);
			if (result.isErr()) return result;
		}

		return Result.ok();
	},
	async messageParallel(message, command, entries, context) {
		const results = await Promise.all(entries.map((entry) => entry.messageRun(message, command, context)));
		// This is simplified compared to PreconditionContainerAny, because we're looking for the first error.
		// However, the base implementation short-circuits with the first Ok.
		return results.find((res) => res.isErr()) ?? Result.ok();
	},
	async chatInputSequential(interaction, command, entries, context) {
		for (const child of entries) {
			const result = await child.chatInputRun(interaction, command, context);
			if (result.isErr()) return result;
		}

		return Result.ok();
	},
	async chatInputParallel(interaction, command, entries, context) {
		const results = await Promise.all(entries.map((entry) => entry.chatInputRun(interaction, command, context)));
		// This is simplified compared to PreconditionContainerAny, because we're looking for the first error.
		// However, the base implementation short-circuits with the first Ok.
		return results.find((res) => res.isErr()) ?? Result.ok();
	},
	async contextMenuSequential(interaction, command, entries, context) {
		for (const child of entries) {
			const result = await child.contextMenuRun(interaction, command, context);
			if (result.isErr()) return result;
		}

		return Result.ok();
	},
	async contextMenuParallel(interaction, command, entries, context) {
		const results = await Promise.all(entries.map((entry) => entry.contextMenuRun(interaction, command, context)));
		// This is simplified compared to PreconditionContainerAny, because we're looking for the first error.
		// However, the base implementation short-circuits with the first Ok.
		return results.find((res) => res.isErr()) ?? Result.ok();
	}
};
