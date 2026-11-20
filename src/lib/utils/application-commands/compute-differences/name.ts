import type { CommandDifference } from './_shared';

export function* checkName({ oldName, newName, key = 'name' }: { key?: string; newName: string; oldName: string }): Generator<CommandDifference> {
	if (oldName !== newName) {
		yield {
			key,
			original: oldName,
			expected: newName
		};
	}
}
