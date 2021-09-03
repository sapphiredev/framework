import { container } from '@sapphire/pieces';
import type { Message } from 'discord.js';
import type { Command } from '../../structures/Command';
import type { PreconditionContext, PreconditionKeys, Preconditions, SimplePreconditionKeys } from '../../structures/Precondition';
import type { IPreconditionContainer } from './IPreconditionContainer';

/**
 * Defines the simple options for the {@link PreconditionContainerSingle}, where only the name of the precondition can
 * be defined.
 * @since 2.0.0
 */
export interface SimplePreconditionSingleResolvableDetails {
	/**
	 * The name of the precondition to retrieve from {@link SapphireClient.preconditions}.
	 * @since 2.0.0
	 */
	name: SimplePreconditionKeys;
}

/**
 * Defines the detailed options for the {@link PreconditionContainerSingle}, where both the {@link PreconditionContext} and the
 * name of the precondition can be defined.
 * @since 1.0.0
 */
export interface PreconditionSingleResolvableDetails<K extends PreconditionKeys = PreconditionKeys> {
	/**
	 * The name of the precondition to retrieve from {@link SapphireClient.preconditions}.
	 * @since 1.0.0
	 */
	name: K;

	/**
	 * The context to be set at {@link PreconditionContainerSingle.context}.
	 * @since 1.0.0
	 */
	context: Preconditions[K];
}

/**
 * Defines the data accepted by {@link PreconditionContainerSingle}'s constructor.
 * @since 1.0.0
 */
export type PreconditionSingleResolvable = SimplePreconditionKeys | SimplePreconditionSingleResolvableDetails | PreconditionSingleResolvableDetails;

/**
 * An {@link IPreconditionContainer} which runs a single precondition from {@link SapphireClient.preconditions}.
 * @since 1.0.0
 */
export class PreconditionContainerSingle implements IPreconditionContainer {
	/**
	 * The context to be used when calling {@link Precondition.run}. This will always be an empty object (`{}`) when the
	 * container was constructed with a string, otherwise it is a direct reference to the value from
	 * {@link PreconditionSingleResolvableDetails.context}.
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
			this.context = Reflect.get(data, 'context') ?? {};
			this.name = data.name;
		}
	}

	/**
	 * Runs the container.
	 * @since 1.0.0
	 * @param message The message that ran this precondition.
	 * @param command The command the message invoked.
	 */
	public run(message: Message, command: Command, context: PreconditionContext = {}) {
		const precondition = container.stores.get('preconditions').get(this.name);
		if (precondition) return precondition.run(message, command, { ...context, ...this.context });
		throw new Error(`The precondition "${this.name}" is not available.`);
	}
}
