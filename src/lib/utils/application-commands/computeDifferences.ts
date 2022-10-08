import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	type APIApplicationCommandIntegerOption,
	type APIApplicationCommandNumberOption,
	type APIApplicationCommandOption,
	type APIApplicationCommandOptionChoice,
	type APIApplicationCommandStringOption,
	type APIApplicationCommandSubcommandGroupOption,
	type APIApplicationCommandSubcommandOption,
	type LocalizationMap,
	type RESTPostAPIApplicationCommandsJSONBody,
	type RESTPostAPIChatInputApplicationCommandsJSONBody,
	type RESTPostAPIContextMenuApplicationCommandsJSONBody
} from 'discord-api-types/v10';
import type { InternalAPICall } from './ApplicationCommandRegistry';

const optionTypeToPrettyName = new Map([
	[ApplicationCommandOptionType.Subcommand, 'subcommand'],
	[ApplicationCommandOptionType.SubcommandGroup, 'subcommand group'],
	[ApplicationCommandOptionType.String, 'string option'],
	[ApplicationCommandOptionType.Integer, 'integer option'],
	[ApplicationCommandOptionType.Boolean, 'boolean option'],
	[ApplicationCommandOptionType.User, 'user option'],
	[ApplicationCommandOptionType.Channel, 'channel option'],
	[ApplicationCommandOptionType.Role, 'role option'],
	[ApplicationCommandOptionType.Mentionable, 'mentionable option'],
	[ApplicationCommandOptionType.Number, 'number option'],
	[ApplicationCommandOptionType.Attachment, 'attachment option']
]);

const contextMenuTypes = [ApplicationCommandType.Message, ApplicationCommandType.User];
const subcommandTypes = [ApplicationCommandOptionType.SubcommandGroup, ApplicationCommandOptionType.Subcommand];

type APIApplicationCommandSubcommandTypes = APIApplicationCommandSubcommandOption | APIApplicationCommandSubcommandGroupOption;
type APIApplicationCommandNumericTypes = APIApplicationCommandIntegerOption | APIApplicationCommandNumberOption;
type APIApplicationCommandChoosableAndAutocompletableTypes = APIApplicationCommandNumericTypes | APIApplicationCommandStringOption;

/**
 * @returns `true` if there are differences, `false` otherwise
 */
export function getCommandDifferencesFast(
	existingCommand: RESTPostAPIApplicationCommandsJSONBody,
	apiData: InternalAPICall['builtData'],
	guildCommand: boolean
) {
	for (const _ of getCommandDifferences(existingCommand, apiData, guildCommand)) {
		// Return immediately on first difference found (also means we skip all other checks)
		return true;
	}

	return false;
}

export function getCommandDifferences(
	existingCommand: RESTPostAPIApplicationCommandsJSONBody,
	apiData: InternalAPICall['builtData'],
	guildCommand: boolean
) {
	const differences: CommandDifference[] = [];

	if (existingCommand.type !== ApplicationCommandType.ChatInput && existingCommand.type) {
		// Check context menus
		if (contextMenuTypes.includes(existingCommand.type ?? ApplicationCommandType.ChatInput)) {
			const casted = apiData as RESTPostAPIContextMenuApplicationCommandsJSONBody;

			// Check name
			if (existingCommand.name !== casted.name) {
				differences.push({
					key: 'name',
					original: existingCommand.name,
					expected: casted.name
				});
			}

			// Check defaultPermissions
			// TODO(vladfrangu): This will be deprecated
			if ((existingCommand.default_permission ?? true) !== (casted.default_permission ?? true)) {
				differences.push({
					key: 'defaultPermission',
					original: String(existingCommand.default_permission ?? true),
					expected: String(casted.default_permission ?? true)
				});
			}

			// Check dmPermission only for non-guild commands
			if (!guildCommand && (existingCommand.dm_permission ?? true) !== (casted.dm_permission ?? true)) {
				differences.push({
					key: 'dmPermission',
					original: String(existingCommand.dm_permission ?? true),
					expected: String(casted.dm_permission ?? true)
				});
			}

			// Check defaultMemberPermissions
			if (existingCommand.default_member_permissions !== casted.default_member_permissions) {
				differences.push({
					key: 'defaultMemberPermissions',
					original: String(existingCommand.default_member_permissions),
					expected: String(casted.default_member_permissions)
				});
			}

			// Check localized names
			const originalLocalizedNames = existingCommand.name_localizations;
			const expectedLocalizedNames = casted.name_localizations;

			if (!originalLocalizedNames && expectedLocalizedNames) {
				differences.push({
					key: 'nameLocalizations',
					original: 'no localized names',
					expected: 'localized names'
				});
			} else if (originalLocalizedNames && !expectedLocalizedNames) {
				differences.push({
					key: 'nameLocalizations',
					original: 'localized names',
					expected: 'no localized names'
				});
			} else if (originalLocalizedNames && expectedLocalizedNames) {
				differences.push(...reportLocalizationMapDifferences(originalLocalizedNames, expectedLocalizedNames, 'nameLocalizations'));
			}
		}

		return differences;
	}

	const casted = apiData as RESTPostAPIChatInputApplicationCommandsJSONBody;

	// Check name
	if (existingCommand.name.toLowerCase() !== casted.name.toLowerCase()) {
		differences.push({
			key: 'name',
			original: existingCommand.name,
			expected: casted.name
		});
	}

	// Check localized names
	const originalLocalizedNames = existingCommand.name_localizations;
	const expectedLocalizedNames = casted.name_localizations;

	if (!originalLocalizedNames && expectedLocalizedNames) {
		differences.push({
			key: 'nameLocalizations',
			original: 'no localized names',
			expected: 'localized names'
		});
	} else if (originalLocalizedNames && !expectedLocalizedNames) {
		differences.push({
			key: 'nameLocalizations',
			original: 'localized names',
			expected: 'no localized names'
		});
	} else if (originalLocalizedNames && expectedLocalizedNames) {
		differences.push(...reportLocalizationMapDifferences(originalLocalizedNames, expectedLocalizedNames, 'nameLocalizations'));
	}

	// Check defaultPermissions
	// TODO(vladfrangu): This will be deprecated
	if ((existingCommand.default_permission ?? true) !== (casted.default_permission ?? true)) {
		differences.push({
			key: 'defaultPermission',
			original: String(existingCommand.default_permission ?? true),
			expected: String(casted.default_permission ?? true)
		});
	}

	// Check dmPermission
	if (!guildCommand && (existingCommand.dm_permission ?? true) !== (casted.dm_permission ?? true)) {
		differences.push({
			key: 'dmPermission',
			original: String(existingCommand.dm_permission ?? true),
			expected: String(casted.dm_permission ?? true)
		});
	}

	// Check defaultMemberPermissions
	if (existingCommand.default_member_permissions !== casted.default_member_permissions) {
		differences.push({
			key: 'defaultMemberPermissions',
			original: String(existingCommand.default_member_permissions),
			expected: String(casted.default_member_permissions)
		});
	}

	// Check description
	if (existingCommand.description !== casted.description) {
		differences.push({
			key: 'description',
			original: existingCommand.description,
			expected: casted.description
		});
	}

	// Check localized descriptions
	const originalLocalizedDescriptions = existingCommand.description_localizations;
	const expectedLocalizedDescriptions = casted.description_localizations;

	if (!originalLocalizedDescriptions && expectedLocalizedDescriptions) {
		differences.push({
			key: 'descriptionLocalizations',
			original: 'no localized descriptions',
			expected: 'localized descriptions'
		});
	} else if (originalLocalizedDescriptions && !expectedLocalizedDescriptions) {
		differences.push({
			key: 'descriptionLocalizations',
			original: 'localized descriptions',
			expected: 'no localized descriptions'
		});
	} else if (originalLocalizedDescriptions && expectedLocalizedDescriptions) {
		differences.push(
			...reportLocalizationMapDifferences(originalLocalizedDescriptions, expectedLocalizedDescriptions, 'descriptionLocalizations')
		);
	}

	// 0. No existing options and now we have options
	if (!existingCommand.options?.length && casted.options?.length) {
		differences.push({
			key: 'options',
			original: 'no options present',
			expected: 'options present'
		});
	}
	// 1. Existing options and now we have no options
	else if (existingCommand.options?.length && !casted.options?.length) {
		differences.push({
			key: 'options',
			original: 'options present',
			expected: 'no options present'
		});
	}
	// 2. Iterate over each option if we have any and see what's different
	else if (casted.options?.length) {
		let index = 0;
		for (const option of casted.options) {
			const currentIndex = index++;
			const existingOption = existingCommand.options![currentIndex];
			differences.push(...reportOptionDifferences({ currentIndex, option, existingOption }));
		}

		// If we went through less options than we previously had, report that
		if (index < existingCommand.options!.length) {
			let option: APIApplicationCommandOption;
			while ((option = existingCommand.options![index]) !== undefined) {
				const expectedType =
					optionTypeToPrettyName.get(option.type) ?? `unknown (${option.type}); please contact Sapphire developers about this!`;

				differences.push({
					key: `existing command option at index ${index}`,
					expected: 'no option present',
					original: `${expectedType} with name ${option.name}`
				});

				index++;
			}
		}
	}

	return differences;
}

function* reportLocalizationMapDifferences(
	originalMap: LocalizationMap,
	expectedMap: LocalizationMap,
	mapName: string
): Generator<CommandDifference> {
	const originalLocalizations = new Map(Object.entries(originalMap));

	for (const [key, value] of Object.entries(expectedMap)) {
		const possiblyExistingEntry = originalLocalizations.get(key) as string | undefined;
		originalLocalizations.delete(key);

		const wasMissingBefore = typeof possiblyExistingEntry === 'undefined';
		const isResetNow = value === null;

		// Was missing before and now is present
		if (wasMissingBefore && !isResetNow) {
			yield {
				key: `${mapName}.${key}`,
				original: 'no localization present',
				expected: value
			};
		}
		// Was present before and now is reset
		else if (!wasMissingBefore && isResetNow) {
			yield {
				key: `${mapName}.${key}`,
				original: possiblyExistingEntry,
				expected: 'no localization present'
			};
		}
		// Not equal
		// eslint-disable-next-line no-negated-condition
		else if (possiblyExistingEntry !== value) {
			yield {
				key: `${mapName}.${key}`,
				original: String(possiblyExistingEntry),
				expected: String(value)
			};
		}
	}

	// Report any remaining localizations
	for (const [key, value] of originalLocalizations) {
		if (value) {
			yield {
				key: `${mapName}.${key}`,
				original: value,
				expected: 'no localization present'
			};
		}
	}
}

export interface CommandDifference {
	key: string;
	expected: string;
	original: string;
}

function* reportOptionDifferences({
	option,
	existingOption,
	currentIndex,
	keyPath = (index: number) => `options[${index}]`
}: {
	option: APIApplicationCommandOption;
	currentIndex: number;
	existingOption?: APIApplicationCommandOption;
	keyPath?: (index: number) => string;
}): Generator<CommandDifference> {
	const expectedType = optionTypeToPrettyName.get(option.type) ?? `unknown (${option.type}); please contact Sapphire developers about this!`;

	// If current option doesn't exist, report and return
	if (!existingOption) {
		yield {
			key: keyPath(currentIndex),
			expected: `${expectedType} with name ${option.name}`,
			original: 'no option present'
		};
		return;
	}

	// Check type
	if (existingOption.type !== option.type) {
		yield {
			key: `${keyPath(currentIndex)}.type`,
			original:
				optionTypeToPrettyName.get(existingOption.type) ?? `unknown (${existingOption.type}); please contact Sapphire developers about this!`,
			expected: expectedType
		};
	}

	// Check name
	if (existingOption.name !== option.name) {
		yield {
			key: `${keyPath(currentIndex)}.name`,
			original: existingOption.name,
			expected: option.name
		};
	}

	// Check localized names
	const originalLocalizedNames = existingOption.name_localizations;
	const expectedLocalizedNames = option.name_localizations;

	if (!originalLocalizedNames && expectedLocalizedNames) {
		yield {
			key: `${keyPath(currentIndex)}.nameLocalizations`,
			original: 'no localized names',
			expected: 'localized names'
		};
	} else if (originalLocalizedNames && !expectedLocalizedNames) {
		yield {
			key: `${keyPath(currentIndex)}.nameLocalizations`,
			original: 'localized names',
			expected: 'no localized names'
		};
	} else if (originalLocalizedNames && expectedLocalizedNames) {
		yield* reportLocalizationMapDifferences(originalLocalizedNames, expectedLocalizedNames, `${keyPath(currentIndex)}.nameLocalizations`);
	}

	// Check description
	if (existingOption.description !== option.description) {
		yield {
			key: `${keyPath(currentIndex)}.description`,
			original: existingOption.description,
			expected: option.description
		};
	}

	// Check localized descriptions
	const originalLocalizedDescriptions = existingOption.description_localizations;
	const expectedLocalizedDescriptions = option.description_localizations;

	if (!originalLocalizedDescriptions && expectedLocalizedDescriptions) {
		yield {
			key: `${keyPath(currentIndex)}.descriptionLocalizations`,
			original: 'no localized descriptions',
			expected: 'localized descriptions'
		};
	} else if (originalLocalizedDescriptions && !expectedLocalizedDescriptions) {
		yield {
			key: `${keyPath(currentIndex)}.descriptionLocalizations`,
			original: 'localized descriptions',
			expected: 'no localized descriptions'
		};
	} else if (originalLocalizedDescriptions && expectedLocalizedDescriptions) {
		yield* reportLocalizationMapDifferences(
			originalLocalizedDescriptions,
			expectedLocalizedDescriptions,
			`${keyPath(currentIndex)}.descriptionLocalizations`
		);
	}

	// Check required
	if ((existingOption.required ?? false) !== (option.required ?? false)) {
		yield {
			key: `${keyPath(currentIndex)}.required`,
			original: String(existingOption.required ?? false),
			expected: String(option.required ?? false)
		};
	}

	// Check for subcommands
	if (subcommandTypes.includes(existingOption.type) && subcommandTypes.includes(option.type)) {
		const castedExisting = existingOption as APIApplicationCommandSubcommandTypes;
		const castedExpected = option as APIApplicationCommandSubcommandTypes;

		if (
			castedExisting.type === ApplicationCommandOptionType.SubcommandGroup &&
			castedExpected.type === ApplicationCommandOptionType.SubcommandGroup
		) {
			// We know we have options in this case, because they are both groups
			for (const [subcommandIndex, subcommandOption] of castedExpected.options!.entries()) {
				yield* reportOptionDifferences({
					currentIndex: subcommandIndex,
					option: subcommandOption,
					existingOption: castedExisting.options?.[subcommandIndex],
					keyPath: (index) => `${keyPath(currentIndex)}.options[${index}]`
				});
			}
		} else if (
			castedExisting.type === ApplicationCommandOptionType.Subcommand &&
			castedExpected.type === ApplicationCommandOptionType.Subcommand
		) {
			// 0. No existing options and now we have options
			if (!castedExisting.options?.length && castedExpected.options?.length) {
				yield {
					key: `${keyPath(currentIndex)}.options`,
					expected: 'options present',
					original: 'no options present'
				};
			}
			// 1. Existing options and now we have no options
			else if (castedExisting.options?.length && !castedExpected.options?.length) {
				yield {
					key: `${keyPath(currentIndex)}.options`,
					expected: 'no options present',
					original: 'options present'
				};
			}
			// 2. Iterate over each option if we have any and see what's different
			else if (castedExpected.options?.length) {
				let processedIndex = 0;
				for (const subcommandOption of castedExpected.options) {
					const currentSubCommandOptionIndex = processedIndex++;
					const existingSubcommandOption = castedExisting.options![currentSubCommandOptionIndex];

					yield* reportOptionDifferences({
						currentIndex: currentSubCommandOptionIndex,
						option: subcommandOption,
						existingOption: existingSubcommandOption,
						keyPath: (index) => `${keyPath(currentIndex)}.options[${index}]`
					});
				}

				// If we went through less options than we previously had, report that
				if (processedIndex < castedExisting.options!.length) {
					let option: APIApplicationCommandOption;
					while ((option = castedExisting.options![processedIndex]) !== undefined) {
						const expectedType =
							optionTypeToPrettyName.get(option.type) ?? `unknown (${option.type}); please contact Sapphire developers about this!`;

						yield {
							key: `existing command option at path ${keyPath(currentIndex)}.options[${processedIndex}]`,
							expected: 'no option present',
							original: `${expectedType} with name ${option.name}`
						};

						processedIndex++;
					}
				}
			}
		}
	}

	if (hasMinMaxValueSupport(option)) {
		// Check min and max_value
		const existingCasted = existingOption as APIApplicationCommandNumericTypes;

		// 0. No min_value and now we have min_value
		if (existingCasted.min_value === undefined && option.min_value !== undefined) {
			yield {
				key: `${keyPath(currentIndex)}.min_value`,
				expected: 'min_value present',
				original: 'no min_value present'
			};
		}
		// 1. Have min_value and now we don't
		else if (existingCasted.min_value !== undefined && option.min_value === undefined) {
			yield {
				key: `${keyPath(currentIndex)}.min_value`,
				expected: 'no min_value present',
				original: 'min_value present'
			};
		}
		// 2. Equality check
		else if (existingCasted.min_value !== option.min_value) {
			yield {
				key: `${keyPath(currentIndex)}.min_value`,
				original: String(existingCasted.min_value),
				expected: String(option.min_value)
			};
		}

		// 0. No max_value and now we have max_value
		if (existingCasted.max_value === undefined && option.max_value !== undefined) {
			yield {
				key: `${keyPath(currentIndex)}.max_value`,
				expected: 'max_value present',
				original: 'no max_value present'
			};
		}
		// 1. Have max_value and now we don't
		else if (existingCasted.max_value !== undefined && option.max_value === undefined) {
			yield {
				key: `${keyPath(currentIndex)}.max_value`,
				expected: 'no max_value present',
				original: 'max_value present'
			};
		}
		// 2. Equality check
		else if (existingCasted.max_value !== option.max_value) {
			yield {
				key: `${keyPath(currentIndex)}.max_value`,
				original: String(existingCasted.max_value),
				expected: String(option.max_value)
			};
		}
	}

	if (hasChoicesAndAutocompleteSupport(option)) {
		const existingCasted = existingOption as APIApplicationCommandChoosableAndAutocompletableTypes;

		// 0. No autocomplete and now it should autocomplete
		if (!existingCasted.autocomplete && option.autocomplete) {
			yield {
				key: `${keyPath(currentIndex)}.autocomplete`,
				expected: 'autocomplete enabled',
				original: 'autocomplete disabled'
			};
		}
		// 1. Have autocomplete and now it shouldn't
		else if (existingCasted.autocomplete && !option.autocomplete) {
			yield {
				key: `${keyPath(currentIndex)}.autocomplete`,
				expected: 'autocomplete disabled',
				original: 'autocomplete enabled'
			};
		}

		if (!option.autocomplete && !existingCasted.autocomplete) {
			// 0. No choices and now we have choices
			if (!existingCasted.choices?.length && option.choices?.length) {
				yield {
					key: `${keyPath(currentIndex)}.choices`,
					expected: 'choices present',
					original: 'no choices present'
				};
			}
			// 1. Have choices and now we don't
			else if (existingCasted.choices?.length && !option.choices?.length) {
				yield {
					key: `${keyPath(currentIndex)}.choices`,
					expected: 'no choices present',
					original: 'choices present'
				};
			}
			// 2. Check every choice to see differences
			else if (option.choices?.length && existingCasted.choices?.length) {
				let index = 0;
				for (const choice of option.choices) {
					const currentChoiceIndex = index++;
					const existingChoice = existingCasted.choices[currentChoiceIndex];

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

						if (!originalLocalizedNames && expectedLocalizedNames) {
							yield {
								key: `${keyPath(currentIndex)}.choices[${currentChoiceIndex}].nameLocalizations`,
								original: 'no localized names',
								expected: 'localized names'
							};
						} else if (originalLocalizedNames && !expectedLocalizedNames) {
							yield {
								key: `${keyPath(currentIndex)}.choices[${currentChoiceIndex}].nameLocalizations`,
								original: 'localized names',
								expected: 'no localized names'
							};
						} else if (originalLocalizedNames && expectedLocalizedNames) {
							yield* reportLocalizationMapDifferences(
								originalLocalizedNames,
								expectedLocalizedNames,
								`${keyPath(currentIndex)}.choices[${currentChoiceIndex}].nameLocalizations`
							);
						}

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
				if (index < existingCasted.choices.length) {
					let choice: APIApplicationCommandOptionChoice;
					while ((choice = existingCasted.choices[index]) !== undefined) {
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

	if (hasMinMaxLengthSupport(option)) {
		// Check min and max_value
		const existingCasted = existingOption as APIApplicationCommandStringOption;

		// 0. No min_length and now we have min_length
		if (existingCasted.min_length === undefined && option.min_length !== undefined) {
			yield {
				key: `${keyPath(currentIndex)}.min_length`,
				expected: 'min_length present',
				original: 'no min_length present'
			};
		}
		// 1. Have min_length and now we don't
		else if (existingCasted.min_length !== undefined && option.min_length === undefined) {
			yield {
				key: `${keyPath(currentIndex)}.min_length`,
				expected: 'no min_length present',
				original: 'min_length present'
			};
		}
		// 2. Equality check
		else if (existingCasted.min_length !== option.min_length) {
			yield {
				key: `${keyPath(currentIndex)}.min_length`,
				original: String(existingCasted.min_length),
				expected: String(option.min_length)
			};
		}

		// 0. No max_length and now we have max_length
		if (existingCasted.max_length === undefined && option.max_length !== undefined) {
			yield {
				key: `${keyPath(currentIndex)}.max_length`,
				expected: 'max_length present',
				original: 'no max_length present'
			};
		}
		// 1. Have max_length and now we don't
		else if (existingCasted.max_length !== undefined && option.max_length === undefined) {
			yield {
				key: `${keyPath(currentIndex)}.max_length`,
				expected: 'no max_length present',
				original: 'max_length present'
			};
		}
		// 2. Equality check
		else if (existingCasted.max_length !== option.max_length) {
			yield {
				key: `${keyPath(currentIndex)}.max_length`,
				original: String(existingCasted.max_length),
				expected: String(option.max_length)
			};
		}
	}
}

function hasMinMaxValueSupport(option: APIApplicationCommandOption): option is APIApplicationCommandNumericTypes {
	return [ApplicationCommandOptionType.Integer, ApplicationCommandOptionType.Number].includes(option.type);
}

function hasChoicesAndAutocompleteSupport(option: APIApplicationCommandOption): option is APIApplicationCommandChoosableAndAutocompletableTypes {
	return [ApplicationCommandOptionType.Integer, ApplicationCommandOptionType.Number, ApplicationCommandOptionType.String].includes(option.type);
}

function hasMinMaxLengthSupport(option: APIApplicationCommandOption): option is APIApplicationCommandStringOption {
	return option.type === ApplicationCommandOptionType.String;
}
