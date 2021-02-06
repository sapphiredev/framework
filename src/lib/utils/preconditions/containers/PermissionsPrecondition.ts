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
	 */
	public constructor(permissions: PermissionResolvable) {
		this.name = 'Permissions';
		this.context = {
			permissions: new Permissions(permissions)
		};
	}
}
