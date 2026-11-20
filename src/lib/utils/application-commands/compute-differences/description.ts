import type { CommandDifference } from './_shared';

export function* checkDescription({
	oldDescription,
	newDescription,
	key = 'description'
}: {
	key?: string;
	newDescription: string;
	oldDescription: string;
}): Generator<CommandDifference> {
	if (oldDescription !== newDescription) {
		yield {
			key,
			original: oldDescription,
			expected: newDescription
		};
	}
}
