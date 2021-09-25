import type { CommandInteraction, ContextMenuInteraction, Message } from 'discord.js';
import type { ChatInputCommand, ContextMenuCommand, MessageCommand } from '../../../structures/Command';
import type { PreconditionContext } from '../../../structures/Precondition';
import type { IPreconditionContainer, PreconditionContainerReturn } from '../IPreconditionContainer';

/**
 * Defines the condition for {@link PreconditionContainerArray}s to run.
 * @since 1.0.0
 */
export interface IPreconditionCondition {
	/**
	 * Runs the containers one by one.
	 * @seealso {@link PreconditionRunMode.sequential}
	 * @since 1.0.0
	 * @param message The message that ran this precondition.
	 * @param command The command the message invoked.
	 * @param entries The containers to run.
	 */
	messageSequential(
		message: Message,
		command: MessageCommand,
		entries: readonly IPreconditionContainer[],
		context: PreconditionContext
	): PreconditionContainerReturn;

	/**
	 * Runs all the containers using `Promise.all`, then checks the results once all tasks finished running.
	 * @seealso {@link PreconditionRunMode.parallel}
	 * @since 1.0.0
	 * @param message The message that ran this precondition.
	 * @param command The command the message invoked.
	 * @param entries The containers to run.
	 */
	messageParallel(
		message: Message,
		command: MessageCommand,
		entries: readonly IPreconditionContainer[],
		context: PreconditionContext
	): PreconditionContainerReturn;

	/**
	 * Runs the containers one by one.
	 * @seealso {@link PreconditionRunMode.sequential}
	 * @since 3.0.0
	 * @param interaction The interaction that ran this precondition.
	 * @param command The command the interaction invoked.
	 * @param entries The containers to run.
	 */
	chatInputSequential(
		interaction: CommandInteraction,
		command: ChatInputCommand,
		entries: readonly IPreconditionContainer[],
		context: PreconditionContext
	): PreconditionContainerReturn;

	/**
	 * Runs all the containers using `Promise.all`, then checks the results once all tasks finished running.
	 * @seealso {@link PreconditionRunMode.parallel}
	 * @since 3.0.0
	 * @param interaction The interaction that ran this precondition.
	 * @param command The command the interaction invoked.
	 * @param entries The containers to run.
	 */
	chatInputParallel(
		interaction: CommandInteraction,
		command: ChatInputCommand,
		entries: readonly IPreconditionContainer[],
		context: PreconditionContext
	): PreconditionContainerReturn;

	/**
	 * Runs the containers one by one.
	 * @seealso {@link PreconditionRunMode.sequential}
	 * @since 3.0.0
	 * @param interaction The interaction that ran this precondition.
	 * @param command The command the interaction invoked.
	 * @param entries The containers to run.
	 */
	contextMenuSequential(
		interaction: ContextMenuInteraction,
		command: ContextMenuCommand,
		entries: readonly IPreconditionContainer[],
		context: PreconditionContext
	): PreconditionContainerReturn;

	/**
	 * Runs all the containers using `Promise.all`, then checks the results once all tasks finished running.
	 * @seealso {@link PreconditionRunMode.parallel}
	 * @since 3.0.0
	 * @param interaction The interaction that ran this precondition.
	 * @param command The command the interaction invoked.
	 * @param entries The containers to run.
	 */
	contextMenuParallel(
		interaction: ContextMenuInteraction,
		command: ContextMenuCommand,
		entries: readonly IPreconditionContainer[],
		context: PreconditionContext
	): PreconditionContainerReturn;
}
