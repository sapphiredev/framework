import type { Message } from 'discord.js';
import type { Command } from '../../../structures/Command';
import type { IPreconditionContainer, PreconditionContainerReturn } from '../IPreconditionContainer';

export interface IPreconditionCondition {
	sequential(message: Message, command: Command, entries: readonly IPreconditionContainer[]): PreconditionContainerReturn;
	parallel(message: Message, command: Command, entries: readonly IPreconditionContainer[]): PreconditionContainerReturn;
}
