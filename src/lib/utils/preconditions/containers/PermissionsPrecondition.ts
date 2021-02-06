import { PermissionResolvable, Permissions } from 'discord.js';
import type { PermissionsPreconditionContext } from '../../../types/Preconditions';
import type { PreconditionSingleResolvableDetails } from '../PreconditionContainerSingle';

/**
 * Constructs a contextful permissions precondition requirement.
 * @since 1.0.0
 * @example
 * ```typescript
 * export class CoreCommand extends Command {
 *   public constructor(context: PieceContext) {
 *     super(context, {
 *       preconditions: [
 *         'GuildOnly',
 *         // Requires the client user to have ADD_REACTIONS in the channel.
 *         new PermissionsPrecondition('ADD_REACTIONS')
 *       ]
 *     });
 *   }
 *
 *   public run(message: Message, args: Args) {
 *     // ...
 *   }
 * }
 * ```
 */
export class PermissionsPrecondition implements PreconditionSingleResolvableDetails {
	public name: string;
	public context: Record<PropertyKey, unknown>;

	/**
	 * Constructs a precondition container entry.
	 * @param permissions The permissions that will be required by this command.
	 * @param options The options for calculating the permissions; see [[PermissionsPreconditionContext]]
	 *   for more information.
	 */
	public constructor(permissions: PermissionResolvable, options: Omit<PermissionsPreconditionContext, 'permissions'> = {}) {
		this.name = 'Permissions';
		this.context = {
			permissions: new Permissions(permissions),
			...options
		};
	}
}
