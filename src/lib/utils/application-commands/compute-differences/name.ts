import type { CommandDifference } from './_shared';

export function* checkName({ oldName, newName, key = 'name' }: { oldName: string; newName: string; key?: string }): Generator<CommandDifference> {
	if (oldName !== newName) {
		yield {
			key,
			original: oldName,
			expected: newName
		};
	}
}
