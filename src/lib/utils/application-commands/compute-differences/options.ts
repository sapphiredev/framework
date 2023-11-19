import type { APIApplicationCommandOption } from 'discord-api-types/v10';
import { optionTypeToPrettyName, type CommandDifference } from './_shared';
import { reportOptionDifferences } from './option';

export function* checkOptions(
	existingOptions?: APIApplicationCommandOption[],
	newOptions?: APIApplicationCommandOption[]
): Generator<CommandDifference> {
	// 0. No existing options and now we have options
	if (!existingOptions?.length && newOptions?.length) {
		yield {
			key: 'options',
			original: 'no options present',
			expected: 'options present'
		};
	}
	// 1. Existing options and now we have no options
	else if (existingOptions?.length && !newOptions?.length) {
		yield {
			key: 'options',
			original: 'options present',
			expected: 'no options present'
		};
	}
	// 2. Iterate over each option if we have any and see what's different
	else if (newOptions?.length) {
		let index = 0;
		for (const option of newOptions) {
			const currentIndex = index++;
			const existingOption = existingOptions![currentIndex];
			yield* reportOptionDifferences({ currentIndex, option, existingOption });
		}

		// If we went through less options than we previously had, report that
		if (index < existingOptions!.length) {
			let option: APIApplicationCommandOption;
			while ((option = existingOptions![index]) !== undefined) {
				const expectedType =
					optionTypeToPrettyName.get(option.type) ?? `unknown (${option.type}); please contact Sapphire developers about this!`;

				yield {
					key: `existing command option at index ${index}`,
					expected: 'no option present',
					original: `${expectedType} with name ${option.name}`
				};

				index++;
			}
		}
	}
}
