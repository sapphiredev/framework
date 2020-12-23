import { Collection, Message } from 'discord.js';
import type { Command } from '../../structures/Command';
import type { IPreconditionCondition } from './conditions/IPreconditionCondition';
import { PreconditionConditionAnd } from './conditions/PreconditionConditionAnd';
import { PreconditionConditionOr } from './conditions/PreconditionConditionOr';
import type { IPreconditionContainer, PreconditionContainerReturn } from './IPreconditionContainer';
import { PreconditionContainerSingle, PreconditionSingleResolvable } from './PreconditionContainerSingle';

export const enum PreconditionRunMode {
	Sequential,
	Parallel
}

export const enum PreconditionRunCondition {
	And,
	Or
}

export interface PreconditionArrayResolvableDetails {
	entries: readonly PreconditionEntryResolvable[];
	mode: PreconditionRunMode;
}
export type PreconditionArrayResolvable = readonly PreconditionEntryResolvable[] | PreconditionArrayResolvableDetails;
export type PreconditionEntryResolvable = PreconditionSingleResolvable | PreconditionArrayResolvable;

function isSingle(entry: PreconditionEntryResolvable): entry is PreconditionSingleResolvable {
	return typeof entry === 'string' || Reflect.has(entry, 'entry');
}

export class PreconditionContainerArray implements IPreconditionContainer {
	public readonly mode: PreconditionRunMode;
	public readonly entries: IPreconditionContainer[];
	protected readonly runCondition: PreconditionRunCondition;

	public constructor(data: PreconditionArrayResolvable, parent: PreconditionContainerArray | null = null) {
		this.entries = [];
		if (Array.isArray(data)) {
			const casted = data as readonly PreconditionEntryResolvable[];

			this.mode = parent?.mode ?? PreconditionRunMode.Sequential;
			this.parse(casted);
		} else {
			const casted = data as PreconditionArrayResolvableDetails;

			this.mode = casted.mode;
			this.parse(casted.entries);
		}

		this.runCondition = parent?.runCondition === PreconditionRunCondition.And ? PreconditionRunCondition.Or : PreconditionRunCondition.And;
	}

	public add(value: IPreconditionContainer): this {
		this.entries.push(value);
		return this;
	}

	public run(message: Message, command: Command): PreconditionContainerReturn {
		return this.mode === PreconditionRunMode.Sequential
			? this.condition.sequential(message, command, this.entries)
			: this.condition.parallel(message, command, this.entries);
	}

	public parse(entries: readonly PreconditionEntryResolvable[]): this {
		for (const entry of entries) {
			this.add(
				isSingle(entry) //
					? new PreconditionContainerSingle(entry)
					: new PreconditionContainerArray(entry, this)
			);
		}

		return this;
	}

	protected get condition(): IPreconditionCondition {
		return PreconditionContainerArray.conditions.get(this.runCondition)!;
	}

	protected static readonly conditions = new Collection<PreconditionRunCondition, IPreconditionCondition>([
		[PreconditionRunCondition.And, PreconditionConditionAnd],
		[PreconditionRunCondition.Or, PreconditionConditionOr]
	]);
}
