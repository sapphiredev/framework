import { Piece } from '@sapphire/pieces';
import type { Awaitable } from '@sapphire/utilities';
import type { BaseCommandInteraction, CommandInteraction, ContextMenuInteraction, Message, TextBasedChannel } from 'discord.js';
import type { UserPermissionsPreconditionContext } from '../../preconditions';
import type { ChannelTypePreconditionContext } from '../../preconditions/ChannelType';
import type { CooldownContext } from '../../preconditions/Cooldown';
import { PreconditionError } from '../errors/PreconditionError';
import type { UserError } from '../errors/UserError';
import { err, ok, Result } from '../parsers/Result';
import type { ChatInputCommand, CommandOptions, ContextMenuCommand, MessageCommand } from './Command';

export type PreconditionResult = Awaitable<Result<unknown, UserError>>;
export type AsyncPreconditionResult = Promise<Result<unknown, UserError>>;

export class Precondition<O extends PreconditionOptions = PreconditionOptions> extends Piece<O> {
	public readonly position: number | null;

	public constructor(context: Piece.Context, options: Precondition.Options = {}) {
		super(context, options);
		this.position = options.position ?? null;
	}

	public parseCommandOptions?(options: CommandOptions): null | Precondition.Context | boolean;

	public messageRun?(message: Message, command: MessageCommand, context: Precondition.Context): Precondition.Result;

	public chatInputRun?(interaction: CommandInteraction, command: ChatInputCommand, context: Precondition.Context): Precondition.Result;

	public contextMenuRun?(interaction: ContextMenuInteraction, command: ContextMenuCommand, context: Precondition.Context): Precondition.Result;

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

	protected async fetchChannelFromInteraction(interaction: BaseCommandInteraction) {
		const channel = (await interaction.client.channels.fetch(interaction.channelId, {
			cache: false,
			allowUnknownGuild: true
		})) as TextBasedChannel;

		return channel;
	}
}

export abstract class AllFlowsPrecondition<O extends PreconditionOptions = PreconditionOptions> extends Precondition<O> {
	public abstract messageRun(message: Message, command: MessageCommand, context: Precondition.Context): Precondition.Result;

	public abstract chatInputRun(interaction: CommandInteraction, command: ChatInputCommand, context: Precondition.Context): Precondition.Result;

	public abstract contextMenuRun(
		interaction: ContextMenuInteraction,
		command: ContextMenuCommand,
		context: Precondition.Context
	): Precondition.Result;
}

/**
 * The registered preconditions and their contexts, if any. When registering new ones, it is recommended to use
 * [module augmentation](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation) so
 * custom ones are registered.
 *
 * When a key's value is `never`, it means that it does not take any context, which allows you to pass its identifier as
 * a bare string (e.g. `preconditions: ['NSFW']`), however, if context is required, a non-`never` type should be passed,
 * which will type {@link PreconditionContainerArray#append} and require an object with the name and a `context` with
 * the defined type.
 *
 * @example
 * ```typescript
 * declare module '@sapphire/framework' {
 *   interface Preconditions {
 *     // A precondition named `Moderator` which does not read `context`:
 *     Moderator: never;
 *
 *     // A precondition named `ChannelPermissions` which does read `context`:
 *     ChannelPermissions: {
 *       permissions: Permissions;
 *     };
 *   }
 * }
 *
 * // [✔] These are valid:
 * preconditions.append('Moderator');
 * preconditions.append({ name: 'Moderator' });
 * preconditions.append({
 *   name: 'ChannelPermissions',
 *   context: { permissions: new Permissions(8) }
 * });
 *
 * // [X] These are invalid:
 * preconditions.append({ name: 'Moderator', context: {} });
 * // ➡ `never` keys do not accept `context`.
 *
 * preconditions.append('ChannelPermissions');
 * // ➡ non-`never` keys always require `context`, a string cannot be used.
 *
 * preconditions.append({
 *   name: 'ChannelPermissions',
 *   context: { unknownProperty: 1 }
 * });
 * // ➡ mismatching `context` properties, `{ unknownProperty: number }` is not
 * // assignable to `{ permissions: Permissions }`.
 * ```
 */
export interface Preconditions {
	Cooldown: CooldownContext;
	Enabled: never;
	NSFW: never;
	ClientPermissions: UserPermissionsPreconditionContext;
	UserPermissions: UserPermissionsPreconditionContext;
	ChannelType: ChannelTypePreconditionContext;
}

export type PreconditionKeys = keyof Preconditions;
export type SimplePreconditionKeys = {
	[K in PreconditionKeys]: Preconditions[K] extends never ? K : never;
}[PreconditionKeys];

export interface PreconditionOptions extends Piece.Options {
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

export namespace Precondition {
	export type Options = PreconditionOptions;
	export type Context = PreconditionContext;
	export type Result = PreconditionResult;
	export type AsyncResult = AsyncPreconditionResult;
}

export namespace AllFlowsPrecondition {
	export type Options = PreconditionOptions;
	export type Context = PreconditionContext;
	export type Result = PreconditionResult;
	export type AsyncResult = AsyncPreconditionResult;
}
