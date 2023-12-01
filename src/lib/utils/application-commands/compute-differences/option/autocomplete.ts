import type { APIApplicationCommandOptionChoice } from 'discord-api-types/v10';
import type { APIApplicationCommandChoosableAndAutocompletableTypes, CommandDifference } from '../_shared';
import { checkLocalizations } from '../localizations';

export function* handleAutocomplete({
	currentIndex,
	existingOption,
	expectedOption,
	keyPath
}: {
	currentIndex: number;
	keyPath: (index: number) => string;
	expectedOption: APIApplicationCommandChoosableAndAutocompletableTypes;
	existingOption: APIApplicationCommandChoosableAndAutocompletableTypes;
}): Generator<CommandDifference> {
	// 0. No autocomplete and now it should autocomplete
	if (!existingOption.autocomplete && expectedOption.autocomplete) {
		yield {
			key: `${keyPath(currentIndex)}.autocomplete`,
			expected: 'autocomplete enabled',
			original: 'autocomplete disabled'
		};
	}
	// 1. Have autocomplete and now it shouldn't
	else if (existingOption.autocomplete && !expectedOption.autocomplete) {
		yield {
			key: `${keyPath(currentIndex)}.autocomplete`,
			expected: 'autocomplete disabled',
			original: 'autocomplete enabled'
		};
	}

	if (!expectedOption.autocomplete && !existingOption.autocomplete) {
		// 0. No choices and now we have choices
		if (!existingOption.choices?.length && expectedOption.choices?.length) {
			yield {
				key: `${keyPath(currentIndex)}.choices`,
				expected: 'choices present',
				original: 'no choices present'
			};
		}
		// 1. Have choices and now we don't
		else if (existingOption.choices?.length && !expectedOption.choices?.length) {
			yield {
				key: `${keyPath(currentIndex)}.choices`,
				expected: 'no choices present',
				original: 'choices present'
			};
		}
		// 2. Check every choice to see differences
		else if (expectedOption.choices?.length && existingOption.choices?.length) {
			let index = 0;
			for (const choice of expectedOption.choices) {
				const currentChoiceIndex = index++;
				const existingChoice = existingOption.choices[currentChoiceIndex];

				// If this choice never existed, return the difference
				if (existingChoice === undefined) {
					yield {
						key: `${keyPath(currentIndex)}.choices[${currentChoiceIndex}]`,
						original: 'no choice present',
						expected: 'choice present'
					};
				} else {
					if (choice.name !== existingChoice.name) {
						yield {
							key: `${keyPath(currentIndex)}.choices[${currentChoiceIndex}].name`,
							original: existingChoice.name,
							expected: choice.name
						};
					}

					// Check localized names
					const originalLocalizedNames = existingChoice.name_localizations;
					const expectedLocalizedNames = choice.name_localizations;

					yield* checkLocalizations({
						localeMapName: `${keyPath(currentIndex)}.choices[${currentChoiceIndex}].nameLocalizations`,
						localePresentMessage: 'localized names',
						localeMissingMessage: 'no localized names',
						originalLocalizedDescriptions: originalLocalizedNames,
						expectedLocalizedDescriptions: expectedLocalizedNames
					});

					if (choice.value !== existingChoice.value) {
						yield {
							key: `${keyPath(currentIndex)}.choices[${currentChoiceIndex}].value`,
							original: String(existingChoice.value),
							expected: String(choice.value)
						};
					}
				}
			}

			// If there are more choices than the expected ones, return the difference
			if (index < existingOption.choices.length) {
				let choice: APIApplicationCommandOptionChoice;
				while ((choice = existingOption.choices[index]) !== undefined) {
					yield {
						key: `existing choice at path ${keyPath(currentIndex)}.choices[${index}]`,
						expected: 'no choice present',
						original: `choice with name "${choice.name}" and value ${
							typeof choice.value === 'number' ? choice.value : `"${choice.value}"`
						} present`
					};

					index++;
				}
			}
		}
	}
}
