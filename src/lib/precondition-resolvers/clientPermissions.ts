import { PermissionsBitField, type PermissionResolvable } from 'discord.js';
import { CommandPreConditions } from '../types/Enums';
import type { PreconditionContainerArray } from '../utils/preconditions/PreconditionContainerArray';

/**
 * Appends the `ClientPermissions` precondition when {@link Command.Options.requiredClientPermissions} resolves to a
 * non-zero bitfield.
 * @param requiredClientPermissions The required client permissions.
 * @param preconditionContainerArray The precondition container array to append the precondition to.
 */
export function parseConstructorPreConditionsRequiredClientPermissions(
	requiredClientPermissions: PermissionResolvable | undefined,
	preconditionContainerArray: PreconditionContainerArray
) {
	const permissions = new PermissionsBitField(requiredClientPermissions);
	if (permissions.bitfield !== 0n) {
		preconditionContainerArray.append({ name: CommandPreConditions.ClientPermissions, context: { permissions } });
	}
}
