import type { CommandDifference } from './_shared';

export function* checkDMPermission(oldDmPermission?: boolean, newDmPermission?: boolean): Generator<CommandDifference> {
	if ((oldDmPermission ?? true) !== (newDmPermission ?? true)) {
		yield {
			key: 'dmPermission',
			original: String(oldDmPermission ?? true),
			expected: String(newDmPermission ?? true)
		};
	}
}
