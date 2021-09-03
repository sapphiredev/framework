import type { Awaited } from '@sapphire/utilities';
import type { Message } from 'discord.js';
import type { UserError } from '../../errors/UserError';
import type { Result } from '../../parsers/Result';
import type { Command } from '../../structures/Command';
import type { PreconditionContext } from '../../structures/Precondition';

/**
 * Defines the result's value for a PreconditionContainer.
 * @since 1.0.0
 */
export type PreconditionContainerResult = Result<unknown, UserError>;

/**
 * Defines the return type of the generic {@link IPreconditionContainer.run}.
 * @since 1.0.0
 */
export type PreconditionContainerReturn = Awaited<PreconditionContainerResult>;

/**
 * Async-only version of {@link PreconditionContainerReturn}, to be used when the run method is async.
 * @since 1.0.0
 */
export type AsyncPreconditionContainerReturn = Promise<PreconditionContainerResult>;

/**
 * An abstracted precondition container to be implemented by classes.
 * @since 1.0.0
 */
export interface IPreconditionContainer {
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

	/**
	 * Runs a precondition container.
	 * @since 1.0.0
	 * @param message The message that ran this precondition.
	 * @param command The command the message invoked.
	 */
	run(message: Message, command: Command, context?: PreconditionContext): PreconditionContainerReturn;
}
