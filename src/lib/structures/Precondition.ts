import { Awaited, Piece, PieceContext, PieceOptions } from '@sapphire/pieces';
import type { Message } from 'discord.js';
import { PreconditionError } from '../errors/PreconditionError';
import type { UserError } from '../errors/UserError';
import { err, ok, Result } from '../parsers/Result';
import type { Command } from './Command';

export type PreconditionResult = Awaited<Result<unknown, UserError>>;
export type AsyncPreconditionResult = Promise<Result<unknown, UserError>>;

export abstract class Precondition extends Piece {
	public readonly position: number | null;

	public constructor(context: PieceContext, options: PreconditionOptions = {}) {
		super(context, options);
		this.position = options.position ?? null;
	}

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

export interface PreconditionOptions extends PieceOptions {
	/**
	 * The position for the precondition to be set at in the global precondition list. If set to `null`, this
	 * precondition will not be set as a global one.
	 * @default null
	 */
	position?: number | null;
}

export interface PreconditionContext extends Record<PropertyKey, unknown> {
	external?: boolean;
}
