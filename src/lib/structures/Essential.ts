import type { Awaited } from '@sapphire/pieces';
import type { Message } from 'discord.js';
import { EssentialError } from '../errors/EssentialError';
import { err, ok, Result } from '../parsers/Result';
import type { PreCommandRunPayload } from '../types/Events';
import { PriorityPiece } from './base/PriorityPiece';
import type { Command } from './Command';

export type EssentialResult = Awaited<Result<unknown, EssentialError>>;
export type AsyncEssentialResult = Promise<Result<unknown, EssentialError>>;
export interface EssentialContext extends PreCommandRunPayload {}

/**
 * A structure that defines whether or not a [[Command]] should run, independiently of its information. This works
 * similarly to global [[Precondition]]s and can be used for properties that may change at any time, for example,
 * checking whether or not a command is enabled.
 * @since 1.0.0
 * @example
 * ```typescript
 * // TypeScript:
 * import { Essential, PieceContext } from '(at)sapphire/framework';
 *
 * // Define a class extending `Essential`, then export it.
 * // NOTE: You can use `export default` or `export =` as well.
 * export class CoreEssential extends Essential {
 *   public constructor(context: PieceContext) {
 *     super(context, { position: 10 });
 *   }
 *
 *   public run(_: Message, command: Command, context: Essential.Context): Essential.Result {
 *     return command.enabled
 *       ? this.ok()
 *       : this.error({
 *           identifier: 'commandDisabled',
 *           message: 'This command is disabled.',
 *           context
 *         });
 *   }
 * }
 * ```
 *
 * @example
 * ```javascript
 * // JavaScript:
 * const { Essential } = require('(at)sapphire/framework');
 *
 * // Define a class extending `Essential`, then export it.
 * module.exports = class CoreEssential extends Essential {
 *   public constructor(context) {
 *     super(context, { position: 10 });
 *   }
 *
 *   public run(_, command, context) {
 *     return command.enabled
 *       ? this.ok()
 *       : this.error({
 *           identifier: 'commandDisabled',
 *           message: 'This command is disabled.',
 *           context
 *         });
 *   }
 * };
 * ```
 */
export abstract class Essential extends PriorityPiece {
	/**
	 * Runs the specific logic for the essential, this is called by [[EssentialStore#run]].
	 * @since 1.0.0
	 * @param message The message that triggered this run.
	 * @param command The command that was used in the message.
	 * @param context The context defining the command handler information.
	 */
	public abstract run(message: Message, command: Command, context: EssentialContext): EssentialResult;

	/**
	 * Wraps a value into a successful value.
	 * @since 1.0.0
	 * @param value The value to wrap.
	 */
	public ok(): EssentialResult {
		return ok();
	}

	/**
	 * Constructs a [[EssentialError]] with the essential parameter set to `this`.
	 * @since 1.0.0
	 * @param options The information.
	 */
	public error(options: Omit<EssentialError.Options, 'essential'> = {}): EssentialResult {
		return err(new EssentialError({ essential: this, ...options }));
	}
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Essential {
	export type Result = EssentialResult;
	export type AsyncResult = AsyncEssentialResult;
	export type Context = PreCommandRunPayload;
}
