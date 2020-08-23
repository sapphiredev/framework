import type { Message } from 'discord.js';
import type { UserError } from '../errors/UserError';
import type { Result } from '../utils/Result';
import type { Awaited } from '../utils/Types';
import { BasePiece } from './base/BasePiece';
import type { Command } from './Command';

export abstract class Argument extends BasePiece {
	public abstract run(argument: string, context: ArgumentContext): Awaited<Result<unknown, UserError>>;
}

export interface ArgumentContext extends Record<PropertyKey, unknown> {
	message: Message;
	command: Command;
	minimum?: number;
	maximum?: number;
	inclusive?: boolean;
}
