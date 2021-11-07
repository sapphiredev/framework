import type { PieceContext } from '@sapphire/pieces';
import type { Message } from 'discord.js';
import type { Command } from './Command';
import { Precondition, PreconditionKeys } from './Precondition';
import { isOk } from '../parsers/Result';

/**
 * The extended precondition class. This class is abstract and is to be extended by subclasses which
 * will implement the {@link ExtendedPrecondition#handle} method.
 * Much like the {@link Precondition} class, this class handles blocking messages coming into the command handler.
 * However, this class can be used to expand upon an existing
 * precondition to perform operations that rely on a different check passing.
 *
 * @example
 * ```typescript
 * // TypeScript:
 * import { ApplyOptions } from '@sapphire/decorators';
 * import { ExtendedPrecondition, ExtendedPreconditionOptions } from '@sapphire/framework';
 * import type { Message } from 'discord.js';
 *
 * // Just like with `Precondition`, you can use `export default` or `export =` too.
 * (at)ApplyOptions<ExtendedPreconditionOptions>({
 *   name: 'ModOnly',
 *   baseArgument: 'GuildOnly'
 * })
 * export class UserPrecondition extends ExtendedPrecondition<'GuildOnly'> {
 *   public handle(message: Message) {
 *     // You now know that `message.member` exists, because the `GuildOnly` precondition was run before this.
 *     const isMod = message.member!.roles.cache.find((role) => role.name === 'Mod');
 *     return isMod
 *       ? this.ok()
 *       : this.error({ identifier: 'preconditionModOnly', message: 'Only moderators can run this command.' });
 *   }
 * }
 * ```
 *
 * @example
 * ```javascript
 * // JavaScript:
 * const { ExtendedPrecondition } = require('@sapphire/framework');
 *
 * module.exports = class UserPrecondition extends ExtendedPrecondition {
 *   constructor(context) {
 *     super(context, { name: 'ModOnly', baseArgument: 'GuildOnly' });
 *   }
 *
 *   handle(message) {
 *     // You now know that `message.member` exists, because the `GuildOnly` precondition was run before this.
 *     const isMod = message.member!.roles.cache.find((role) => role.name === 'Mod');
 *     return isMod
 *       ? this.ok()
 *       : this.error({ identifier: 'preconditionModOnly', message: 'Only moderators can run this command.' });
 *   }
 * }
 * ```
 */
export abstract class ExtendedPrecondition<
	K extends PreconditionKeys,
	O extends ExtendedPreconditionOptions<K> = ExtendedPreconditionOptions<K>
> extends Precondition<O> {
	public basePrecondition: K;

	public constructor(context: PieceContext, options: O) {
		super(context, options);
		this.basePrecondition = options.basePrecondition;
	}

	/**
	 * Represents the underlying precondition that is depended on
	 */
	public get base(): Precondition {
		return this.container.stores.get('preconditions').get(this.basePrecondition)!;
	}

	public async run(message: Message, command: Command, context: Precondition.Context): Precondition.AsyncResult {
		const result = await this.base.run(message, command, context);
		// If the result was successful (i.e. is of type `Ok<unknown>`), pass its
		// value to [[ExtendedPrecondition#handle]] for further parsing. Otherwise, return
		// the error as is; it'll provide contextual information from the base precondition.
		return isOk(result) ? this.handle(message, command, context) : result;
	}

	public abstract handle(message: Message, command: Command, context: Precondition.Context): Precondition.Result;
}

export interface ExtendedPreconditionOptions<K extends PreconditionKeys> extends Precondition.Options {
	/**
	 * The name of the underlying precondition that is depended on.
	 * See {@link PreconditionKeys} for valid keys.
	 */
	basePrecondition: K;
}
