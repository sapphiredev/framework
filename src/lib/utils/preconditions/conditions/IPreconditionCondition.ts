import type { ChatInputCommandInteraction, ContextMenuCommandInteraction, Message } from 'discord.js';
import type { PreconditionContext } from '../../../structures/Precondition';
import type { ChatInputCommand, ContextMenuCommand, MessageCommand } from '../../../types/CommandTypes';
import type { IPreconditionContainer, PreconditionContainerReturn } from '../IPreconditionContainer';
import type { PreconditionContainerArray, PreconditionRunMode } from '../PreconditionContainerArray';

/**
 * Defines the condition for {@link PreconditionContainerArray}s to run.
 *
 * @remarks Available since 1.0.0
 */
export interface IPreconditionCondition {
	/**
	 * Runs all the containers using `Promise.all`, then checks the results once all tasks finished running.
	 *
	 * @see {@link PreconditionRunMode.Parallel}
	 * @remarks Available since 3.0.0
	 * @param interaction - The interaction that ran this precondition.
	 * @param command - The command the interaction invoked.
	 * @param entries - The containers to run.
	 * @param context - The context for the precondition.
	 */
	chatInputParallel(
		interaction: ChatInputCommandInteraction,
		command: ChatInputCommand,
		entries: readonly IPreconditionContainer[],
		context: PreconditionContext
	): PreconditionContainerReturn;

	/**
	 * Runs the containers one by one.
	 *
	 * @see {@link PreconditionRunMode.Sequential}
	 * @remarks Available since 3.0.0
	 * @param interaction - The interaction that ran this precondition.
	 * @param command - The command the interaction invoked.
	 * @param entries - The containers to run.
	 * @param context - The context for the precondition.
	 */
	chatInputSequential(
		interaction: ChatInputCommandInteraction,
		command: ChatInputCommand,
		entries: readonly IPreconditionContainer[],
		context: PreconditionContext
	): PreconditionContainerReturn;

	/**
	 * Runs all the containers using `Promise.all`, then checks the results once all tasks finished running.
	 *
	 * @see {@link PreconditionRunMode.Parallel}
	 * @remarks Available since 3.0.0
	 * @param interaction - The interaction that ran this precondition.
	 * @param command - The command the interaction invoked.
	 * @param entries - The containers to run.
	 * @param context - The context for the precondition.
	 */
	contextMenuParallel(
		interaction: ContextMenuCommandInteraction,
		command: ContextMenuCommand,
		entries: readonly IPreconditionContainer[],
		context: PreconditionContext
	): PreconditionContainerReturn;

	/**
	 * Runs the containers one by one.
	 *
	 * @see {@link PreconditionRunMode.Sequential}
	 * @remarks Available since 3.0.0
	 * @param interaction - The interaction that ran this precondition.
	 * @param command - The command the interaction invoked.
	 * @param entries - The containers to run.
	 * @param context - The context for the precondition.
	 */
	contextMenuSequential(
		interaction: ContextMenuCommandInteraction,
		command: ContextMenuCommand,
		entries: readonly IPreconditionContainer[],
		context: PreconditionContext
	): PreconditionContainerReturn;

	/**
	 * Runs all the containers using `Promise.all`, then checks the results once all tasks finished running.
	 *
	 * @see {@link PreconditionRunMode.Parallel}
	 * @remarks Available since 1.0.0
	 * @param message - The message that ran this precondition.
	 * @param command - The command the message invoked.
	 * @param entries - The containers to run.
	 * @param context - The context for the precondition.
	 */
	messageParallel(
		message: Message,
		command: MessageCommand,
		entries: readonly IPreconditionContainer[],
		context: PreconditionContext
	): PreconditionContainerReturn;

	/**
	 * Runs the containers one by one.
	 *
	 * @see {@link PreconditionRunMode.Sequential}
	 * @remarks Available since 1.0.0
	 * @param message - The message that ran this precondition.
	 * @param command - The command the message invoked.
	 * @param entries - The containers to run.
	 * @param context - The context for the precondition.
	 */
	messageSequential(
		message: Message,
		command: MessageCommand,
		entries: readonly IPreconditionContainer[],
		context: PreconditionContext
	): PreconditionContainerReturn;
}
