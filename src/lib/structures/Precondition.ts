import { Piece, PieceContext, PieceOptions } from '@sapphire/pieces';
import type { Awaited } from '@sapphire/utilities';
import type { Message } from 'discord.js';
import { PreconditionError } from '../errors/PreconditionError';
import type { UserError } from '../errors/UserError';
import { err, ok, Result } from '../parsers/Result';
import type { Command } from './Command';

export type PreconditionResult = Awaited<Result<unknown, UserError>>;
export type AsyncPreconditionResult = Promise<Result<unknown, UserError>>;

export abstract class Precondition extends Piece {
	public readonly position: number | null;

	public constructor(context: PieceContext, options: Precondition.Options = {}) {
		super(context, options);
		this.position = options.position ?? null;
	}

	public abstract run(message: Message, command: Command, context: Precondition.Context): Precondition.Result;

	public ok(): Precondition.Result {
		return ok();
	}

	/**
	 * Constructs a {@link PreconditionError} with the precondition parameter set to `this`.
	 * @param options The information.
	 */
	public error(options: Omit<PreconditionError.Options, 'precondition'> = {}): Precondition.Result {
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

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Precondition {
	export type Options = PreconditionOptions;
	export type Context = PreconditionContext;
	export type Result = PreconditionResult;
	export type AsyncResult = AsyncPreconditionResult;
}
