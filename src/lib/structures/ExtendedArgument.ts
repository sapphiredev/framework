import type { PieceContext } from '@sapphire/pieces';
import type { ArgType } from '../parsers/Args';
import { isOk } from '../parsers/Result';
import { Argument, IArgument } from './Argument';

/**
 * @deprecated {@link ExtendedArgument} is deprecated and will be removed in v3.0.0.
 * Use {@link Argument} instead, and abstract the resolving of the argument data to an external resolver.
 * ---
 * The extended argument class. This class is abstract and is to be extended by subclasses which
 * will implement the {@link ExtendedArgument#handle} method.
 * Much like the {@link Argument} class, this class handles parsing user-specified command arguments
 * into typed command parameters. However, this class can be used to expand upon an existing
 * argument in order to process its transformed value rather than just the argument string.
 *
 * @example
 * ```typescript
 * // TypeScript:
 * import { ApplyOptions } from '@sapphire/decorators';
 * import { ExtendedArgument, ExtendedArgumentContext, ExtendedArgumentOptions } from '@sapphire/framework';
 * import type { Channel, TextChannel } from 'discord.js';
 *
 * // Just like with `Argument`, you can use `export default` or `export =` too.
 * (at)ApplyOptions<ExtendedArgumentOptions>({
 *   name: 'textChannel',
 *   baseArgument: 'channel'
 * })
 * export class TextChannelArgument extends ExtendedArgument<'channel', TextChannel> {
 *   public handle(parsed: Channel, { argument }: ExtendedArgumentContext): Argument.Result<TextChannel> {
 *     return parsed.type === 'text'
 *       ? this.ok(parsed as TextChannel)
 *       : this.error({ identifier: 'ArgumentTextChannelInvalidTextChannel', message: 'The argument did not resolve to a text channel.' });
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
 *       : this.error({ identifier: 'ArgumentTextChannelInvalidTextChannel', message: 'The argument did not resolve to a text channel' });
 *   }
 * }
 * ```
 */
export abstract class ExtendedArgument<K extends keyof ArgType, T> extends Argument<T> {
	public baseArgument: K;

	/**
	 * @deprecated {@link ExtendedArgument} is deprecated and will be removed in v3.0.0.
	 */
	public constructor(context: PieceContext, options: ExtendedArgumentOptions<K>) {
		super(context, options);
		this.baseArgument = options.baseArgument;
	}

	/**
	 * Represents the underlying argument that transforms the raw argument
	 * into the value used to compute the extended argument's value.
	 * @deprecated {@link ExtendedArgument} is deprecated and will be removed in v3.0.0.
	 */
	public get base(): IArgument<ArgType[K]> {
		return this.container.stores.get('arguments').get(this.baseArgument) as IArgument<ArgType[K]>;
	}

	/**
	 * @deprecated {@link ExtendedArgument} is deprecated and will be removed in v3.0.0.
	 */
	public async run(parameter: string, context: Argument.Context<T>): Argument.AsyncResult<T> {
		const result = await this.base.run(parameter, context as unknown as Argument.Context<ArgType[K]>);
		// If the result was successful (i.e. is of type `Ok<ArgType[K]>`), pass its
		// value to [[ExtendedArgument#handle]] for further parsing. Otherwise, return
		// the error as is; it'll provide contextual information from the base argument.
		return isOk(result) ? this.handle(result.value, { ...context, parameter }) : result;
	}

	/**
	 * @deprecated {@link ExtendedArgument} is deprecated and will be removed in v3.0.0.
	 */
	public abstract handle(parsed: ArgType[K], context: ExtendedArgumentContext): Argument.Result<T>;
}

/**
 * @deprecated {@link ExtendedArgument} is deprecated and will be removed in v3.0.0.
 */
export interface ExtendedArgumentOptions<K extends keyof ArgType> extends Argument.Options {
	/**
	 * The name of the underlying argument whose value is used to compute
	 * the extended argument value; see {@link ArgType} for valid keys.
	 */
	baseArgument: K;
}

/**
 * @deprecated {@link ExtendedArgument} is deprecated and will be removed in v3.0.0.
 */
export interface ExtendedArgumentContext extends Argument.Context {
	/**
	 * The canonical parameter specified by the user in the command, as
	 * a string, equivalent to the first parameter of {@link Argument#run}.
	 * This allows {@link ExtendedArgument#handle} to access the original
	 * argument, which is useful for returning {@link Argument#error} so
	 * that you don't have to convert the parsed argument back into a
	 * string.
	 */
	parameter: string;
}
