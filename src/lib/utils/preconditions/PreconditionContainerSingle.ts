import { Store } from '@sapphire/pieces';
import type { Message } from 'discord.js';
import type { Command } from '../../structures/Command';
import type { PreconditionContext } from '../../structures/Precondition';
import type { IPreconditionContainer } from './IPreconditionContainer';

/**
 * Defines the detailed options for the [[PreconditionContainerSingle]], where both the [[PreconditionContext]] and the
 * name of the precondition can be defined.
 * @since 1.0.0
 */
export interface PreconditionSingleResolvableDetails {
	/**
	 * The name of the precondition to retrieve from [[SapphireClient.preconditions]].
	 * @since 1.0.0
	 */
	name: string;

	/**
	 * The context to be set at [[PreconditionContainerSingle.context]].
	 * @since 1.0.0
	 */
	context: Record<PropertyKey, unknown>;
}

/**
 * Defines the data accepted by [[PreconditionContainerSingle]]'s constructor.
 * @since 1.0.0
 */
export type PreconditionSingleResolvable = string | PreconditionSingleResolvableDetails;

/**
 * An [[IPreconditionContainer]] which runs a single precondition from [[SapphireClient.preconditions]].
 * @since 1.0.0
 */
export class PreconditionContainerSingle implements IPreconditionContainer {
	/**
	 * The context to be used when calling [[Precondition.run]]. This will always be an empty object (`{}`) when the
	 * container was constructed with a string, otherwise it is a direct reference to the value from
	 * [[PreconditionSingleResolvableDetails.context]].
	 * @since 1.0.0
	 */
	public readonly context: Record<PropertyKey, unknown>;

	/**
	 * The name of the precondition to run.
	 * @since 1.0.0
	 */
	public readonly name: string;

	public constructor(data: PreconditionSingleResolvable) {
		if (typeof data === 'string') {
			this.context = {};
			this.name = data;
		} else {
			this.context = data.context;
			this.name = data.name;
		}
	}

	/**
	 * Runs the container.
	 * @since 1.0.0
	 * @param message The message that ran this precondition.
	 * @param command The command the message invoked.
	 */
	public run(message: Message, command: Command, context: PreconditionContext) {
		const precondition = Store.injectedContext.stores.get('preconditions').get(this.name);
		if (precondition) return precondition.run(message, command, { ...context, ...this.context });
		throw new Error(`The precondition "${this.name}" is not available.`);
	}
}
