import type { APIApplicationCommandStringOption } from 'discord-api-types/v10';
import type { CommandDifference } from '../_shared';

export function* handleMinMaxLengthOptions({
	currentIndex,
	existingOption,
	expectedOption,
	keyPath
}: {
	currentIndex: number;
	keyPath: (index: number) => string;
	expectedOption: APIApplicationCommandStringOption;
	existingOption: APIApplicationCommandStringOption;
}): Generator<CommandDifference> {
	// 0. No min_length and now we have min_length
	if (existingOption.min_length === undefined && expectedOption.min_length !== undefined) {
		yield {
			key: `${keyPath(currentIndex)}.min_length`,
			expected: 'min_length present',
			original: 'no min_length present'
		};
	}
	// 1. Have min_length and now we don't
	else if (existingOption.min_length !== undefined && expectedOption.min_length === undefined) {
		yield {
			key: `${keyPath(currentIndex)}.min_length`,
			expected: 'no min_length present',
			original: 'min_length present'
		};
	}
	// 2. Equality check
	else if (existingOption.min_length !== expectedOption.min_length) {
		yield {
			key: `${keyPath(currentIndex)}.min_length`,
			original: String(existingOption.min_length),
			expected: String(expectedOption.min_length)
		};
	}

	// 0. No max_length and now we have max_length
	if (existingOption.max_length === undefined && expectedOption.max_length !== undefined) {
		yield {
			key: `${keyPath(currentIndex)}.max_length`,
			expected: 'max_length present',
			original: 'no max_length present'
		};
	}
	// 1. Have max_length and now we don't
	else if (existingOption.max_length !== undefined && expectedOption.max_length === undefined) {
		yield {
			key: `${keyPath(currentIndex)}.max_length`,
			expected: 'no max_length present',
			original: 'max_length present'
		};
	}
	// 2. Equality check
	else if (existingOption.max_length !== expectedOption.max_length) {
		yield {
			key: `${keyPath(currentIndex)}.max_length`,
			original: String(existingOption.max_length),
			expected: String(expectedOption.max_length)
		};
	}
}
