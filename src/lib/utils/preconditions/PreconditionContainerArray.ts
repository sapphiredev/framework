import { Collection, Message } from 'discord.js';
import type { Command } from '../../structures/Command';
import type { PreconditionContext } from '../../structures/Precondition';
import type { IPreconditionCondition } from './conditions/IPreconditionCondition';
import { PreconditionConditionAnd } from './conditions/PreconditionConditionAnd';
import { PreconditionConditionOr } from './conditions/PreconditionConditionOr';
import type { IPreconditionContainer, PreconditionContainerReturn } from './IPreconditionContainer';
import { PreconditionContainerSingle, PreconditionSingleResolvable } from './PreconditionContainerSingle';

/**
 * The run mode for a {@link PreconditionContainerArray}.
 * @since 1.0.0
 */
export const enum PreconditionRunMode {
	/**
	 * The entries are run sequentially, this is the default behaviour and can be slow when doing long asynchronous
	 * tasks, but is performance savvy.
	 * @since 1.0.0
	 */
	Sequential,

	/**
	 * All entries are run in parallel using `Promise.all`, then the results are processed after all of them have
	 * completed.
	 * @since 1.0.0
	 */
	Parallel
}

/**
 * The condition for a {@link PreconditionContainerArray}.
 */
export enum PreconditionRunCondition {
	/**
	 * Defines a condition where all the entries must pass. This uses {@link PreconditionConditionAnd}.
	 * @since 1.0.0
	 */
	And,

	/**
	 * Defines a condition where at least one entry must pass. This uses {@link PreconditionConditionOr}.
	 * @since 1.0.0
	 */
	Or
}

/**
 * Defines the detailed options for the {@link PreconditionContainerArray}, where both the {@link PreconditionRunMode} and the
 * entries can be defined.
 * @since 1.0.0
 */
export interface PreconditionArrayResolvableDetails {
	/**
	 * The data that will be used to resolve {@link IPreconditionContainer} dependent of this one.
	 * @since 1.0.0
	 */
	entries: readonly PreconditionEntryResolvable[];

	/**
	 * The mode the {@link PreconditionContainerArray} will run.
	 * @since 1.0.0
	 */
	mode: PreconditionRunMode;
}

/**
 * Defines the data accepted by {@link PreconditionContainerArray}'s constructor.
 * @since 1.0.0
 */
export type PreconditionArrayResolvable = readonly PreconditionEntryResolvable[] | PreconditionArrayResolvableDetails;

/**
 * Defines the data accepted for each entry of the array.
 * @since 1.0.0
 * @seealso {@link PreconditionArrayResolvable}
 * @seealso {@link PreconditionArrayResolvableDetails.entries}
 */
export type PreconditionEntryResolvable = PreconditionSingleResolvable | PreconditionArrayResolvable;

function isSingle(entry: PreconditionEntryResolvable): entry is PreconditionSingleResolvable {
	return typeof entry === 'string' || Reflect.has(entry, 'name');
}

/**
 * An {@link IPreconditionContainer} that defines an array of multiple {@link IPreconditionContainer}s.
 *
 * By default, array containers run either of two conditions: AND and OR ({@link PreconditionRunCondition}), the top level
 * will always default to AND, where the nested one flips the logic (OR, then children arrays are AND, then OR...).
 *
 * This allows `['Connect', ['Moderator', ['DJ', 'SongAuthor']]]` to become a thrice-nested precondition container, where:
 * - Level 1: [Single(Connect), Array] runs AND, both containers must return a successful value.
 * - Level 2: [Single(Moderator), Array] runs OR, either container must return a successful value.
 * - Level 3: [Single(DJ), Single(SongAuthor)] runs AND, both containers must return a successful value.
 *
 * In other words, it is identical to doing:
 * ```typescript
 * Connect && (Moderator || (DJ && SongAuthor));
 * ```
 * @remark More advanced logic can be accomplished by adding more {@link IPreconditionCondition}s (e.g. other operators),
 * see {@link PreconditionContainerArray.conditions} for more information.
 * @since 1.0.0
 */
export class PreconditionContainerArray implements IPreconditionContainer {
	/**
	 * The mode at which this precondition will run.
	 * @since 1.0.0
	 */
	public readonly mode: PreconditionRunMode;

	/**
	 * The {@link IPreconditionContainer}s the array holds.
	 * @since 1.0.0
	 */
	public readonly entries: IPreconditionContainer[];

	/**
	 * The {@link PreconditionRunCondition} that defines how entries must be handled.
	 * @since 1.0.0
	 */
	public readonly runCondition: PreconditionRunCondition;

	public constructor(data: PreconditionArrayResolvable = [], parent: PreconditionContainerArray | null = null) {
		this.entries = [];
		this.runCondition = parent?.runCondition === PreconditionRunCondition.And ? PreconditionRunCondition.Or : PreconditionRunCondition.And;

		if (Array.isArray(data)) {
			const casted = data as readonly PreconditionEntryResolvable[];

			this.mode = parent?.mode ?? PreconditionRunMode.Sequential;
			this.parse(casted);
		} else {
			const casted = data as PreconditionArrayResolvableDetails;

			this.mode = casted.mode;
			this.parse(casted.entries);
		}
	}

	/**
	 * Adds a new entry to the array.
	 * @since 1.0.0
	 * @param entry The value to add to the entries.
	 */
	public add(entry: IPreconditionContainer): this {
		this.entries.push(entry);
		return this;
	}

	/**
	 * Runs the container.
	 * @since 1.0.0
	 * @param message The message that ran this precondition.
	 * @param command The command the message invoked.
	 */
	public run(message: Message, command: Command, context: PreconditionContext = {}): PreconditionContainerReturn {
		return this.mode === PreconditionRunMode.Sequential
			? this.condition.sequential(message, command, this.entries, context)
			: this.condition.parallel(message, command, this.entries, context);
	}

	/**
	 * Parses the precondition entry resolvables, and adds them to the entries.
	 * @since 1.0.0
	 * @param entries The entries to parse.
	 */
	protected parse(entries: Iterable<PreconditionEntryResolvable>): this {
		for (const entry of entries) {
			this.add(
				isSingle(entry) //
					? new PreconditionContainerSingle(entry)
					: new PreconditionContainerArray(entry, this)
			);
		}

		return this;
	}

	/**
	 * Retrieves a condition from {@link PreconditionContainerArray.conditions}, assuming existence.
	 * @since 1.0.0
	 */
	protected get condition(): IPreconditionCondition {
		return PreconditionContainerArray.conditions.get(this.runCondition)!;
	}

	/**
	 * The preconditions to be run. Extra ones can be added by augmenting {@link PreconditionRunCondition} and then
	 * inserting {@link IPreconditionCondition}s.
	 * @since 1.0.0
	 * @example
	 * ```typescript
	 * // Adding more kinds of conditions
	 *
	 * // Set the new condition:
	 * PreconditionContainerArray.conditions.set(2, PreconditionConditionRandom);
	 *
	 * // Augment Sapphire to add the new condition, in case of a JavaScript
	 * // project, this can be moved to an `Augments.d.ts` (or any other name)
	 * // file somewhere:
	 * declare module '@sapphire/framework' {
	 *   export enum PreconditionRunCondition {
	 *     Random = 2
	 *   }
	 * }
	 * ```
	 */
	public static readonly conditions = new Collection<PreconditionRunCondition, IPreconditionCondition>([
		[PreconditionRunCondition.And, PreconditionConditionAnd],
		[PreconditionRunCondition.Or, PreconditionConditionOr]
	]);
}
