import type { Message } from 'discord.js';
import type { Awaited } from '../utils/Types';
import { BasePiece } from './base/BasePiece';
import type { Command } from './Command';

export abstract class Precondition extends BasePiece {
	public abstract run(message: Message, command: Command, context: PreconditionContext): Awaited<boolean>;
}

export interface PreconditionContext extends Record<PropertyKey, unknown> {}
