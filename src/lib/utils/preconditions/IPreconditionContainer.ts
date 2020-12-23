import type { Awaited } from '@sapphire/pieces';
import type { Message } from 'discord.js';
import type { UserError } from '../../errors/UserError';
import type { Command } from '../../structures/Command';
import type { Result } from '../Result';

export type PreconditionContainerResult = Result<unknown, UserError>;
export type PreconditionContainerReturn = Awaited<PreconditionContainerResult>;
export type AsyncPreconditionContainerReturn = Promise<PreconditionContainerResult>;

export interface IPreconditionContainer {
	run(message: Message, command: Command): PreconditionContainerReturn;
}
