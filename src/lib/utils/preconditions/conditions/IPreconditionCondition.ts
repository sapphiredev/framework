import type { Message } from 'discord.js';
import type { Command } from '../../../structures/Command';
import type { IPreconditionContainer, PreconditionContainerReturn } from '../IPreconditionContainer';

/**
 * Defines the condition for [[PreconditionContainerArray]]s to run.
 * @since 1.0.0
 */
export interface IPreconditionCondition {
	/**
	 * Runs the containers one by one.
	 * @seealso [[PreconditionRunMode.sequential]]
	 * @since 1.0.0
	 * @param message The message that ran this precondition.
	 * @param command The command the message invoked.
	 * @param entries The containers to run.
	 */
	sequential(message: Message, command: Command, entries: readonly IPreconditionContainer[]): PreconditionContainerReturn;

	/**
	 * Runs all the containers using `Promise.all`, then checks the results once all tasks finished running.
	 * @seealso [[PreconditionRunMode.parallel]]
	 * @since 1.0.0
	 * @param message The message that ran this precondition.
	 * @param command The command the message invoked.
	 * @param entries The containers to run.
	 */
	parallel(message: Message, command: Command, entries: readonly IPreconditionContainer[]): PreconditionContainerReturn;
}
