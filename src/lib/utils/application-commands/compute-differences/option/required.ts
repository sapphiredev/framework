import type { CommandDifference } from '../_shared';

export function* checkOptionRequired({
	oldRequired,
	newRequired,
	key
}: {
	key: string;
	newRequired?: boolean;
	oldRequired?: boolean;
}): Generator<CommandDifference> {
	if ((oldRequired ?? false) !== (newRequired ?? false)) {
		yield {
			key,
			original: String(oldRequired ?? false),
			expected: String(newRequired ?? false)
		};
	}
}
