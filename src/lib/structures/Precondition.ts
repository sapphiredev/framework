import { Piece } from '@sapphire/pieces';
import type { Message } from 'discord.js';
import type { Awaited } from '../utils/Types';
import type { Command } from './Command';

export abstract class Precondition extends Piece {
	public abstract run(message: Message, command: Command, context: PreconditionContext): Awaited<boolean>;
}

export interface PreconditionContext extends Record<PropertyKey, unknown> {}
