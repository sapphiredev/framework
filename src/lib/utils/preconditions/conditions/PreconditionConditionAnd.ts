import { isErr, ok } from '../../../parsers/Result';
import type { IPreconditionCondition } from './IPreconditionCondition';

/**
 * An {@link IPreconditionCondition} which runs all containers similarly to doing (V0 && V1 [&& V2 [&& V3 ...]]).
 * @since 1.0.0
 */
export const PreconditionConditionAnd: IPreconditionCondition = {
	async sequential(message, command, entries, context) {
		for (const child of entries) {
			const result = await child.run(message, command, context);
			if (isErr(result)) return result;
		}

		return ok();
	},
	async parallel(message, command, entries, context) {
		const results = await Promise.all(entries.map((entry) => entry.run(message, command, context)));
		// This is simplified compared to PreconditionContainerAny because we're looking for the first error.
		// However, the base implementation short-circuits with the first Ok.
		return results.find(isErr) ?? ok();
	}
};
