import type { CommandDifference } from '../_shared';

export function* checkOptionRequired({
	oldRequired,
	newRequired,
	key
}: {
	oldRequired?: boolean;
	newRequired?: boolean;
	key: string;
}): Generator<CommandDifference> {
	if ((oldRequired ?? false) !== (newRequired ?? false)) {
		yield {
			key,
			original: String(oldRequired ?? false),
			expected: String(newRequired ?? false)
		};
	}
}
