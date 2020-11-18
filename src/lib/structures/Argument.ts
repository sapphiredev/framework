import type { AliasPieceOptions, PieceContext } from '@sapphire/pieces';
import type { Message } from 'discord.js';
import type { UserError } from '../errors/UserError';
import { Args, ArgType } from '../utils/Args';
import { err, isOk, ok, Result } from '../utils/Result';
import type { Awaited } from '../utils/Types';
import { BaseAliasPiece } from './base/BaseAliasPiece';
import type { Command } from './Command';

/**
 * Defines a synchronous result of an [[Argument]], check [[AsyncArgumentResult]] for the asynchronous version.
 */
export type ArgumentResult<T> = Awaited<Result<T, UserError>>;

/**
 * Defines an asynchronous result of an [[Argument]], check [[ArgumentResult]] for the synchronous version.
 */
export type AsyncArgumentResult<T> = Promise<Result<T, UserError>>;

export interface IArgument<T> {
	/**
	 * The name of the argument, this is used to make the identification of an argument easier.
	 */
	readonly name: string;

	/**
	 * The method which is called when invoking the argument.
	 * @param argument The argument to parse.
	 * @param context The context for the method call, contains the message, command, and other options.
	 */
	run(argument: string, context: ArgumentContext): ArgumentResult<T>;
}

/**
 * The base argument class. This class is abstract and is to be extended by subclasses implementing the methods. In
 * Sapphire's workflow, arguments are called when using [[Args]]'s methods (usually used inside [[Command]]s by default).
 *
 * @example
 * ```typescript
 * // TypeScript:
 * import { Argument, ArgumentResult, PieceContext } from 'sapphire/framework';
 * import { URL } from 'url';
 *
 * // Define a class extending `Argument`, then export it.
 * // NOTE: You can use `export default` or `export =` too.
 * export class CoreArgument extends Argument<URL> {
 *   public constructor(context: PieceContext) {
 *     super(context, { name: 'hyperlink', aliases: ['url'] });
 *   }
 *
 *   public run(argument: string): ArgumentResult<URL> {
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
 * declare module 'sapphire/framework/dist/lib/utils/Args' {
 *   export interface ArgType {
 *     url: URL;
 *   }
 * }
 * ```
 *
 * @example
 * ```javascript
 * // JavaScript:
 * const { Argument } = require('sapphire/framework');
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
export abstract class Argument<T = unknown> extends BaseAliasPiece implements IArgument<T> {
	public abstract run(argument: string, context: ArgumentContext): ArgumentResult<T>;

	/**
	 * Wraps a value into a successful value.
	 * @param value The value to wrap.
	 */
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

/**
 * The extended argument class. This class is abstract and is to be extended by subclasses which
 * will implement the [[ExtendedArgument#handle]] method.
 * Much like the [[Argument]] class, this class handles parsing user-specified command arguments
 * into typed command parameters. However, this class can be used to expand upon an existing
 * argument in order to process its transformed value rather than just the argument string.
 *
 * @example
 * ```typescript
 * // TypeScript:
 * import { ApplyOptions } from '@sapphire/decorators';
 * import { ArgumentResult, ExtendedArgument, ExtendedArgumentContext, ExtendedArgumentOptions } from '@sapphire/framework';
 * import type { Channel, TextChannel } from 'discord.js';
 *
 * // Just like with `Argument`, you can use `export default` or `export =` too.
 * @ApplyOptions<ExtendedArgumentOptions>({
 *   name: 'textChannel',
 *   baseArgument: 'channel'
 * })
 * export class TextChannelArgument extends ExtendedArgument<'channel', TextChannel> {
 *   public handle(parsed: Channel, { argument }: ExtendedArgumentContext): ArgumentResult<TextChannel> {
 *     return parsed.type === 'text'
 *       ? this.ok(parsed as TextChannel)
 *       : this.error(argument, 'ArgumentTextChannelInvalidTextChannel', 'The argument did not resolve to a text channel.');
 *   }
 * }
 * ```
 *
 * @example
 * ```javascript
 * // JavaScript:
 * const { ExtendedArgument } = require('@sapphire/framework');
 *
 * module.exports = class TextChannelArgument extends ExtendedArgument {
 *   constructor(context) {
 *     super(context, { name: 'textChannel', baseArgument: 'channel' });
 *   }
 *
 *   handle(parsed, { argument }) {
 *     return parsed.type === 'text'
 *       ? this.ok(parsed)
 *       : this.error(argument, 'ArgumentTextChannelInvalidTextChannel', 'The argument did not resolve to a text channel/');
 *   }
 * }
 * ```
 */
export abstract class ExtendedArgument<K extends keyof ArgType, T> extends Argument<T> {
	public baseArgument: K;

	public constructor(context: PieceContext, options: ExtendedArgumentOptions<K>) {
		super(context, options);
		this.baseArgument = options.baseArgument;
	}

	/**
	 * Represents the underlying argument that transforms the raw argument
	 * into the value used to compute the extended argument's value.
	 */
	public get base(): IArgument<ArgType[K]> {
		return this.client.arguments.get(this.baseArgument) as IArgument<ArgType[K]>;
	}

	public async run(argument: string, context: ArgumentContext): AsyncArgumentResult<T> {
		const result = await this.base.run(argument, context);
		return isOk(result)
			? // The base argument resolved; handle it and use it to compute the extended argument.
			  this.handle(result.value, { ...context, argument })
			: // The base argument failed to resolve.
			  this.error(argument, 'ExtendedArgumentInvalidArgument', `The argument did not resolve to a ${this.base.name}.`);
	}

	public abstract handle(parsed: ArgType[K], context: ExtendedArgumentContext): ArgumentResult<T>;
}

export interface ArgumentOptions extends AliasPieceOptions {}

export interface ExtendedArgumentOptions<K extends keyof ArgType> extends ArgumentOptions {
	/**
	 * The name of the underlying argument whose value is used to compute
	 * the extended argument value; see [[ArgType]] for valid keys.
	 */
	baseArgument: K;
}

export interface ArgumentContext extends Record<PropertyKey, unknown> {
	message: Message;
	command: Command;
	minimum?: number;
	maximum?: number;
	inclusive?: boolean;
}

export interface ExtendedArgumentContext extends ArgumentContext {
	/**
	 * The canonical argument specified by the user in the command, as
	 * a string, equivalent to the first parameter of [[Argument#run]].
	 * This allows [[ExtendedArgument#handle]] to access the original
	 * argument, which is useful for returning [[Argument#error]] so
	 * that you don't have to convert the parsed argument back into a
	 * string.
	 */
	argument: string;
}
