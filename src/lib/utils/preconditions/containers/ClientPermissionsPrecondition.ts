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
 *         new ClientPermissionsPrecondition('ADD_REACTIONS')
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
export class ClientPermissionsPrecondition implements PreconditionSingleResolvableDetails<'ClientPermissions'> {
	public name: 'ClientPermissions';
	public context: { permissions: Permissions };

	/**
	 * Constructs a precondition container entry.
	 * @param permissions The permissions that will be required by this command.
	 */
	public constructor(permissions: PermissionResolvable) {
		this.name = 'ClientPermissions';
		this.context = {
			permissions: new Permissions(permissions)
		};
	}
}
