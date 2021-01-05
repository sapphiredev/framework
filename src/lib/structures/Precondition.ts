import { Awaited, Piece } from '@sapphire/pieces';
import type { Message } from 'discord.js';
import { PreconditionError, PreconditionErrorExtras } from '../errors/PreconditionError';
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
	 * Constructs an [[ArgumentError]] with [[ArgumentError#type]] set to the [[IArgument<T>#name]].
	 * @param message The description message for the rejection.
	 */
	public error(message: string, extras?: PreconditionErrorExtras): PreconditionResult;
	/**
	 * Constructs an [[ArgumentError]] with a custom type.
	 * @param type The identifier for the error.
	 * @param message The description message for the rejection.
	 */
	// eslint-disable-next-line @typescript-eslint/unified-signatures
	public error(type: string, message: string, extras?: PreconditionErrorExtras): PreconditionResult;
	public error(typeOrMessage: string, rawMessage?: string | PreconditionErrorExtras, rawExtras?: PreconditionErrorExtras): PreconditionResult {
		const [type, message, extras] =
			typeof rawMessage === 'string' ? [typeOrMessage, rawMessage, rawExtras] : [this.name, typeOrMessage, rawMessage];
		return err(new PreconditionError(this, type, message, extras));
	}
}

export interface PreconditionContext extends Record<PropertyKey, unknown> {}
