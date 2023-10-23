import { PermissionsBitField, type PermissionResolvable } from 'discord.js';
import { CommandPreConditions } from '../types/Enums';
import type { PreconditionContainerArray } from '../utils/preconditions/PreconditionContainerArray';

/**
 * Appends the `UserPermissions` precondition when {@link Command.Options.requiredUserPermissions} resolves to a
 * non-zero bitfield.
 * @param requiredClientPermissions The required user permissions.
 * @param preconditionContainerArray The precondition container array to append the precondition to.
 */
export function parseConstructorPreConditionsRequiredUserPermissions(
	requiredUserPermissions: PermissionResolvable | undefined,
	preconditionContainerArray: PreconditionContainerArray
) {
	const permissions = new PermissionsBitField(requiredUserPermissions);
	if (permissions.bitfield !== 0n) {
		preconditionContainerArray.append({ name: CommandPreConditions.UserPermissions, context: { permissions } });
	}
}
