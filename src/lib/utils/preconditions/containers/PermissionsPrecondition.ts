import { PermissionResolvable, Permissions } from 'discord.js';
import type { PreconditionContext } from '../../../structures/Precondition';
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
	public context: PreconditionContext;

	/**
	 * Constructs a precondition container entry.
	 * @param permissions The permissions that will be required by this command.
	 */
	public constructor(permissions: PermissionResolvable, options: Omit<PermissionsPreconditionContext, 'permissions'> = {}) {
		this.name = 'Permissions';
		this.context = {
			permissions: new Permissions(permissions),
			...options
		};
	}
}
