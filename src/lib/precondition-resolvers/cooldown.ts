import { container } from '@sapphire/pieces';
import type { Command } from '../structures/Command';
import { BucketScope, CommandPreConditions } from '../types/Enums';
import { type PreconditionContainerArray } from '../utils/preconditions/PreconditionContainerArray';

/**
 * Appends the `Cooldown` precondition when {@link Command.Options.cooldownLimit} and
 * {@link Command.Options.cooldownDelay} are both non-zero.
 *
 * @param command The command to parse cooldowns for.
 * @param cooldownLimit The cooldown limit to use.
 * @param cooldownDelay The cooldown delay to use.
 * @param cooldownScope The cooldown scope to use.
 * @param cooldownFilteredUsers The cooldown filtered users to use.
 * @param preconditionContainerArray The precondition container array to append the precondition to.
 */
export function parseConstructorPreConditionsCooldown<P, O extends Command.Options>(
	command: Command<P, O>,
	cooldownLimit: number | undefined,
	cooldownDelay: number | undefined,
	cooldownScope: BucketScope | undefined,
	cooldownFilteredUsers: string[] | undefined,
	preconditionContainerArray: PreconditionContainerArray
) {
	const { defaultCooldown } = container.client.options;

	// We will check for whether the command is filtered from the defaults, but we will allow overridden values to
	// be set. If an overridden value is passed, it will have priority. Otherwise, it will default to 0 if filtered
	// (causing the precondition to not be registered) or the default value with a fallback to a single-use cooldown.
	const filtered = defaultCooldown?.filteredCommands?.includes(command.name) ?? false;
	const limit = cooldownLimit ?? (filtered ? 0 : defaultCooldown?.limit ?? 1);
	const delay = cooldownDelay ?? (filtered ? 0 : defaultCooldown?.delay ?? 0);

	if (limit && delay) {
		const scope = cooldownScope ?? defaultCooldown?.scope ?? BucketScope.User;
		const filteredUsers = cooldownFilteredUsers ?? defaultCooldown?.filteredUsers;
		preconditionContainerArray.append({
			name: CommandPreConditions.Cooldown,
			context: { scope, limit, delay, filteredUsers }
		});
	}
}
