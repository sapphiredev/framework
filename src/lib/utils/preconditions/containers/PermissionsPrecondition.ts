import { PermissionResolvable, Permissions } from 'discord.js';
import type { PreconditionContext } from '../../../structures/Precondition';
import type { PreconditionSingleResolvableDetails } from '../PreconditionContainerSingle';

/**
 * Constructs a contextful permissions precondition requirement.
 * @example
 * ```typescript
 * export class CoreCommand extends Command {
 *   public constructor(context: PieceContext) {
 *     super(context, {
 *       preconditions: [
 *         'GuildOnly',
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
	public entry: string;
	public context: PreconditionContext;

	/**
	 * Constructs a precondition container entry.
	 * @param permissions The permissions that will be required by this command.
	 */
	public constructor(permissions: PermissionResolvable) {
		this.entry = 'Permissions';
		this.context = {
			permissions: new Permissions(permissions)
		};
	}
}
