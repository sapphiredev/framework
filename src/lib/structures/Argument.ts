import type { Message } from 'discord.js';
import type { UserError } from '../errors/UserError';
import type { Result } from '../utils/Result';
import type { Awaited } from '../utils/Types';
import { BasePiece } from './base/BasePiece';
import type { Command } from './Command';

export interface IArgument<T> {
	run(argument: string, context: ArgumentContext): Awaited<Result<T, UserError>>;
}

export abstract class Argument<T = unknown> extends BasePiece implements IArgument<T> {
	public abstract run(argument: string, context: ArgumentContext): Awaited<Result<T, UserError>>;
}

export interface ArgumentContext extends Record<PropertyKey, unknown> {
	message: Message;
	command: Command;
	minimum?: number;
	maximum?: number;
	inclusive?: boolean;
}
