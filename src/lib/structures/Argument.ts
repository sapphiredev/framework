import type { Message } from 'discord.js';
import type { UserError } from '../errors/UserError';
import { Args } from '../utils/Args';
import { err, ok, Result } from '../utils/Result';
import type { Awaited } from '../utils/Types';
import { BasePiece } from './base/BasePiece';
import type { Command } from './Command';

export type ArgumentResult<T> = Awaited<Result<T, UserError>>;
export type AsyncArgumentResult<T> = Promise<Result<T, UserError>>;

export interface IArgument<T> {
	readonly name: string;
	run(argument: string, context: ArgumentContext): ArgumentResult<T>;
}

export abstract class Argument<T = unknown> extends BasePiece implements IArgument<T> {
	public abstract run(argument: string, context: ArgumentContext): ArgumentResult<T>;

	public ok(value: T): ArgumentResult<T> {
		return ok(value);
	}

	/**
	 * Constructs an [[ArgumentError]] with [[ArgumentError#type]] set to the [[IArgument<T>#name]].
	 * @param parameter The parameter that triggered the argument.
	 * @param message The description message for the rejection.
	 */
	public error(parameter: string, message: string): ArgumentResult<T>;
	/**
	 * Constructs an [[ArgumentError]] with a custom type.
	 * @param parameter The parameter that triggered the argument.
	 * @param type The identifier for the error.
	 * @param message The description message for the rejection.
	 */
	// eslint-disable-next-line @typescript-eslint/unified-signatures
	public error(parameter: string, type: string, message: string): ArgumentResult<T>;
	public error(parameter: string, typeOrMessage: string, rawMessage?: string): ArgumentResult<T> {
		return err(Args.error<T>(this, parameter, typeOrMessage, rawMessage!));
	}
}

export interface ArgumentContext extends Record<PropertyKey, unknown> {
	message: Message;
	command: Command;
	minimum?: number;
	maximum?: number;
	inclusive?: boolean;
}
