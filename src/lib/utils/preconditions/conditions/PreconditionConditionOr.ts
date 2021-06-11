import { isOk, ok } from '../../../parsers/Result';
import type { PreconditionContainerResult } from '../IPreconditionContainer';
import type { IPreconditionCondition } from './IPreconditionCondition';

/**
 * An {@link IPreconditionCondition} which runs all containers similarly to doing (V0 || V1 [|| V2 [|| V3 ...]]).
 * @since 1.0.0
 */
export const PreconditionConditionOr: IPreconditionCondition = {
	async sequential(message, command, entries, context) {
		let error: PreconditionContainerResult | null = null;
		for (const child of entries) {
			const result = await child.run(message, command, context);
			if (isOk(result)) return result;
			error = result;
		}

		return error ?? ok();
	},
	async parallel(message, command, entries, context) {
		const results = await Promise.all(entries.map((entry) => entry.run(message, command, context)));

		let error: PreconditionContainerResult | null = null;
		for (const result of results) {
			if (isOk(result)) return result;
			error = result;
		}

		return error ?? ok();
	}
};
