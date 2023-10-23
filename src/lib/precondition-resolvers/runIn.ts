import { isNullish } from '@sapphire/utilities';
import type { ChannelType } from 'discord.js';
import { Command } from '../structures/Command';
import type { CommandRunInUnion, CommandSpecificRunIn } from '../types/CommandTypes';
import { CommandPreConditions } from '../types/Enums';
import type { PreconditionContainerArray } from '../utils/preconditions/PreconditionContainerArray';

/**
 * Appends the `RunIn` precondition based on the values passed, defaulting to `null`, which doesn't add a
 * precondition.
 * @param runIn The command's `runIn` option field from the constructor.
 * @param resolveConstructorPreConditionsRunType The function to resolve the run type from the constructor.
 * @param preconditionContainerArray The precondition container array to append the precondition to.
 */
export function parseConstructorPreConditionsRunIn(
	runIn: CommandRunInUnion | CommandSpecificRunIn,
	resolveConstructorPreConditionsRunType: (types: CommandRunInUnion) => readonly ChannelType[] | null,
	preconditionContainerArray: PreconditionContainerArray
) {
	// Early return if there's no runIn option:
	if (isNullish(runIn)) return;

	if (Command.runInTypeIsSpecificsObject(runIn)) {
		const messageRunTypes = resolveConstructorPreConditionsRunType(runIn.messageRun);
		const chatInputRunTypes = resolveConstructorPreConditionsRunType(runIn.chatInputRun);
		const contextMenuRunTypes = resolveConstructorPreConditionsRunType(runIn.contextMenuRun);

		if (messageRunTypes !== null || chatInputRunTypes !== null || contextMenuRunTypes !== null) {
			preconditionContainerArray.append({
				name: CommandPreConditions.RunIn,
				context: {
					types: {
						messageRun: messageRunTypes ?? [],
						chatInputRun: chatInputRunTypes ?? [],
						contextMenuRun: contextMenuRunTypes ?? []
					}
				}
			});
		}
	} else {
		const types = resolveConstructorPreConditionsRunType(runIn);
		if (types !== null) {
			preconditionContainerArray.append({ name: CommandPreConditions.RunIn, context: { types } });
		}
	}
}
