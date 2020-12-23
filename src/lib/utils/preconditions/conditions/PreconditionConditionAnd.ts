import { isErr, ok } from '../../Result';
import type { IPreconditionCondition } from './IPreconditionCondition';

export const PreconditionConditionAnd: IPreconditionCondition = {
	async sequential(message, command, entries) {
		for (const child of entries) {
			const result = await child.run(message, command);
			if (isErr(result)) return result;
		}

		return ok();
	},
	async parallel(message, command, entries) {
		const results = await Promise.all(entries.map((entry) => entry.run(message, command)));
		// This is simplified compared to PreconditionContainerAny because we're looking for the first error.
		// However, the base implementation short-circuits with the first Ok.
		return results.find(isErr) ?? ok();
	}
};
