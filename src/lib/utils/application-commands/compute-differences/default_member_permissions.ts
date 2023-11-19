import type { CommandDifference } from './_shared';

export function* checkDefaultMemberPermissions(oldPermissions?: string | null, newPermissions?: string | null): Generator<CommandDifference> {
	if (oldPermissions !== newPermissions) {
		yield {
			key: 'defaultMemberPermissions',
			original: String(oldPermissions),
			expected: String(newPermissions)
		};
	}
}
