import { isOk, ok } from '@sapphire/result';
import type { PreconditionContainerResult } from '../IPreconditionContainer';
import type { IPreconditionCondition } from './IPreconditionCondition';

/**
 * An {@link IPreconditionCondition} which runs all containers similarly to doing (V0 || V1 [|| V2 [|| V3 ...]]).
 * @since 1.0.0
 */
export const PreconditionConditionOr: IPreconditionCondition = {
	async messageSequential(message, command, entries, context) {
		let error: PreconditionContainerResult | null = null;
		for (const child of entries) {
			const result = await child.messageRun(message, command, context);
			if (isOk(result)) return result;
			error = result;
		}

		return error ?? ok();
	},
	async messageParallel(message, command, entries, context) {
		const results = await Promise.all(entries.map((entry) => entry.messageRun(message, command, context)));

		let error: PreconditionContainerResult | null = null;
		for (const result of results) {
			if (isOk(result)) return result;
			error = result;
		}

		return error ?? ok();
	},
	async chatInputSequential(interaction, command, entries, context) {
		let error: PreconditionContainerResult | null = null;
		for (const child of entries) {
			const result = await child.chatInputRun(interaction, command, context);
			if (isOk(result)) return result;
			error = result;
		}

		return error ?? ok();
	},
	async chatInputParallel(interaction, command, entries, context) {
		const results = await Promise.all(entries.map((entry) => entry.chatInputRun(interaction, command, context)));

		let error: PreconditionContainerResult | null = null;
		for (const result of results) {
			if (isOk(result)) return result;
			error = result;
		}

		return error ?? ok();
	},
	async contextMenuSequential(interaction, command, entries, context) {
		let error: PreconditionContainerResult | null = null;
		for (const child of entries) {
			const result = await child.contextMenuRun(interaction, command, context);
			if (isOk(result)) return result;
			error = result;
		}

		return error ?? ok();
	},
	async contextMenuParallel(interaction, command, entries, context) {
		const results = await Promise.all(entries.map((entry) => entry.contextMenuRun(interaction, command, context)));

		let error: PreconditionContainerResult | null = null;
		for (const result of results) {
			if (isOk(result)) return result;
			error = result;
		}

		return error ?? ok();
	}
};
