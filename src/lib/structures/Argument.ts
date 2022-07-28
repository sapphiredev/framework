import { AliasPiece } from '@sapphire/pieces';
import type { Result } from '@sapphire/result';
import type { Awaitable } from '@sapphire/utilities';
import type { Message } from 'discord.js';
import type { ArgumentError } from '../errors/ArgumentError';
import type { UserError } from '../errors/UserError';
import { Args } from '../parsers/Args';
import type { MessageCommand } from './Command';

/**
 * Defines a synchronous result of an {@link Argument}, check {@link Argument.AsyncResult} for the asynchronous version.
 */
export type ArgumentResult<T> = Awaitable<Result<T, UserError>>;

/**
 * Defines an asynchronous result of an {@link Argument}, check {@link Argument.Result} for the synchronous version.
 */
export type AsyncArgumentResult<T> = Promise<Result<T, UserError>>;

export interface IArgument<T> {
	/**
	 * The name of the argument, this is used to make the identification of an argument easier.
	 */
	readonly name: string;

	/**
	 * The method which is called when invoking the argument.
	 * @param parameter The string parameter to parse.
	 * @param context The context for the method call, contains the message, command, and other options.
	 */
	run(parameter: string, context: Argument.Context<T>): Argument.Result<T>;
}

/**
 * The base argument class. This class is abstract and is to be extended by subclasses implementing the methods. In
 * Sapphire's workflow, arguments are called when using {@link Args}'s methods (usually used inside {@link Command}s by default).
 *
 * @example
 * ```typescript
 * // TypeScript:
 * import { Argument, PieceContext } from '@sapphire/framework';
 * import { URL } from 'url';
 *
 * // Define a class extending `Argument`, then export it.
 * // NOTE: You can use `export default` or `export =` too.
 * export class CoreArgument extends Argument<URL> {
 *   public constructor(context: PieceContext) {
 *     super(context, { name: 'hyperlink', aliases: ['url'] });
 *   }
 *
 *   public run(argument: string): Argument.Result<URL> {
 *     try {
 *       return this.ok(new URL(argument));
 *     } catch {
 *       return this.error(argument, 'ArgumentHyperlinkInvalidURL', 'The argument did not resolve to a valid URL.');
 *     }
 *   }
 * }
 *
 * // Augment the ArgType structure so `args.pick('url')`, `args.repeat('url')`
 * // and others have a return type of `URL`.
 * declare module '@sapphire/framework' {
 *   export interface ArgType {
 *     url: URL;
 *   }
 * }
 * ```
 *
 * @example
 * ```javascript
 * // JavaScript:
 * const { Argument } = require('@sapphire/framework');
 *
 * // Define a class extending `Argument`, then export it.
 * module.exports = class CoreArgument extends Argument {
 *   constructor(context) {
 *     super(context, { name: 'hyperlink', aliases: ['url'] });
 *   }
 *
 *   run(argument) {
 *     try {
 *       return this.ok(new URL(argument));
 *     } catch {
 *       return this.error(argument, 'ArgumentHyperlinkInvalidURL', 'The argument did not resolve to a valid URL.');
 *     }
 *   }
 * }
 * ```
 */
export abstract class Argument<T = unknown, O extends Argument.Options = Argument.Options> extends AliasPiece<O> implements IArgument<T> {
	public abstract run(parameter: string, context: Argument.Context<T>): Argument.Result<T>;

	/**
	 * Wraps a value into a successful value.
	 * @param value The value to wrap.
	 */
	public ok(value: T): Argument.Result<T> {
		return Args.ok(value);
	}

	/**
	 * Constructs an {@link Err} result containing an {@link ArgumentError} with a custom type.
	 * @param parameter The parameter that triggered the argument.
	 * @param type The identifier for the error.
	 * @param message The description message for the rejection.
	 */
	public error(options: Omit<ArgumentError.Options<T>, 'argument'>): Argument.Result<T> {
		return Args.error({ argument: this, identifier: this.name, ...options });
	}

	/**
	 * Constructs an {@link ArgumentError} with a custom type.
	 * @param parameter The parameter that triggered the argument.
	 * @param type The identifier for the error.
	 * @param message The description message for the rejection.
	 */
	public errorContext(options: Omit<ArgumentError.Options<T>, 'argument'>): ArgumentError<T> {
		return Args.errorContext({ argument: this, identifier: this.name, ...options });
	}
}

export interface ArgumentOptions extends AliasPiece.Options {}

export interface ArgumentContext<T = unknown> extends Record<PropertyKey, unknown> {
	argument: IArgument<T>;
	args: Args;
	message: Message;
	command: MessageCommand;
	commandContext: MessageCommand.RunContext;
	minimum?: number;
	maximum?: number;
	inclusive?: boolean;
}

export namespace Argument {
	export type Options = ArgumentOptions;
	export type Context<T = unknown> = ArgumentContext<T>;
	export type Result<T> = ArgumentResult<T>;
	export type AsyncResult<T> = AsyncArgumentResult<T>;
}
