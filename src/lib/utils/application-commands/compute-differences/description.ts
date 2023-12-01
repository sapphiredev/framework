import type { CommandDifference } from './_shared';

export function* checkDescription({
	oldDescription,
	newDescription,
	key = 'description'
}: {
	oldDescription: string;
	newDescription: string;
	key?: string;
}): Generator<CommandDifference> {
	if (oldDescription !== newDescription) {
		yield {
			key,
			original: oldDescription,
			expected: newDescription
		};
	}
}
