import { isOk, ok } from '../../Result';
import type { PreconditionContainerResult } from '../IPreconditionContainer';
import type { IPreconditionCondition } from './IPreconditionCondition';

export const PreconditionConditionOr: IPreconditionCondition = {
	async sequential(message, command, entries) {
		let error: PreconditionContainerResult | null = null;
		for (const child of entries) {
			const result = await child.run(message, command);
			if (isOk(result)) return result;
			error = result;
		}

		return error ?? ok();
	},
	async parallel(message, command, entries) {
		const results = await Promise.all(entries.map((entry) => entry.run(message, command)));

		let error: PreconditionContainerResult | null = null;
		for (const result of results) {
			if (isOk(result)) return result;
			error = result;
		}

		return error ?? ok();
	}
};
