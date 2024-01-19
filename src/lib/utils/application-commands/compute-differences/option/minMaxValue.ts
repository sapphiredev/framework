import type { APIApplicationCommandMinAndMaxValueTypes, CommandDifference } from '../_shared';

export function* handleMinMaxValueOptions({
	currentIndex,
	existingOption,
	expectedOption,
	keyPath
}: {
	currentIndex: number;
	keyPath: (index: number) => string;
	expectedOption: APIApplicationCommandMinAndMaxValueTypes;
	existingOption: APIApplicationCommandMinAndMaxValueTypes;
}): Generator<CommandDifference> {
	// 0. No min_value and now we have min_value
	if (existingOption.min_value === undefined && expectedOption.min_value !== undefined) {
		yield {
			key: `${keyPath(currentIndex)}.min_value`,
			expected: 'min_value present',
			original: 'no min_value present'
		};
	}
	// 1. Have min_value and now we don't
	else if (existingOption.min_value !== undefined && expectedOption.min_value === undefined) {
		yield {
			key: `${keyPath(currentIndex)}.min_value`,
			expected: 'no min_value present',
			original: 'min_value present'
		};
	}
	// 2. Equality check
	else if (existingOption.min_value !== expectedOption.min_value) {
		yield {
			key: `${keyPath(currentIndex)}.min_value`,
			original: String(existingOption.min_value),
			expected: String(expectedOption.min_value)
		};
	}

	// 0. No max_value and now we have max_value
	if (existingOption.max_value === undefined && expectedOption.max_value !== undefined) {
		yield {
			key: `${keyPath(currentIndex)}.max_value`,
			expected: 'max_value present',
			original: 'no max_value present'
		};
	}
	// 1. Have max_value and now we don't
	else if (existingOption.max_value !== undefined && expectedOption.max_value === undefined) {
		yield {
			key: `${keyPath(currentIndex)}.max_value`,
			expected: 'no max_value present',
			original: 'max_value present'
		};
	}
	// 2. Equality check
	else if (existingOption.max_value !== expectedOption.max_value) {
		yield {
			key: `${keyPath(currentIndex)}.max_value`,
			original: String(existingOption.max_value),
			expected: String(expectedOption.max_value)
		};
	}
}
