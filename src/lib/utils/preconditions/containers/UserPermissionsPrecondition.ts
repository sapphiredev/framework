import { PermissionResolvable, Permissions } from 'discord.js';
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
 *         new UserPermissionsPrecondition('ADD_REACTIONS')
 *       ]
 *     });
 *   }
 *
 *   public messageRun(message: Message, args: Args) {
 *     // ...
 *   }
 * }
 * ```
 */
export class UserPermissionsPrecondition implements PreconditionSingleResolvableDetails<'UserPermissions'> {
	public name: 'UserPermissions';
	public context: { permissions: Permissions };

	/**
	 * Constructs a precondition container entry.
	 * @param permissions The permissions that will be required by this command.
	 */
	public constructor(permissions: PermissionResolvable) {
		this.name = 'UserPermissions';
		this.context = {
			permissions: new Permissions(permissions)
		};
	}
}
