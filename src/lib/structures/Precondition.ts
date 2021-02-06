import { Awaited, Piece } from '@sapphire/pieces';
import type { Message } from 'discord.js';
import { PreconditionError } from '../errors/PreconditionError';
import type { UserError } from '../errors/UserError';
import { err, ok, Result } from '../parsers/Result';
import type { Command } from './Command';

export type PreconditionResult = Awaited<Result<unknown, UserError>>;
export type AsyncPreconditionResult = Promise<Result<unknown, UserError>>;

export abstract class Precondition extends Piece {
	public abstract run(message: Message, command: Command, context: PreconditionContext): PreconditionResult;

	public ok(): PreconditionResult {
		return ok();
	}

	/**
	 * Constructs a [[PreconditionError]] with the precondition parameter set to `this`.
	 * @param options The information.
	 */
	public error(options: Omit<PreconditionError.Options, 'precondition'> = {}): PreconditionResult {
		return err(new PreconditionError({ precondition: this, ...options }));
	}
}

export interface PreconditionContext extends Record<PropertyKey, unknown> {
	command: Command;
}
