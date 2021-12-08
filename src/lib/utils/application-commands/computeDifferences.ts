import {
	ApplicationCommandType,
	ApplicationCommandOptionType,
	APIApplicationCommandOption,
	APIApplicationCommandSubCommandOptions,
	RESTPostAPIApplicationCommandsJSONBody,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	RESTPostAPIContextMenuApplicationCommandsJSONBody
} from 'discord-api-types/v9';
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
	[ApplicationCommandOptionType.Number, 'number option']
]);

const contextMenuTypes = [ApplicationCommandType.Message, ApplicationCommandType.User];
const subcommandTypes = [ApplicationCommandOptionType.SubcommandGroup, ApplicationCommandOptionType.Subcommand];

export function getCommandDifferences(existingCommand: RESTPostAPIApplicationCommandsJSONBody, apiData: InternalAPICall['builtData']) {
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
		}

		return differences;
	}

	const casted = apiData as RESTPostAPIChatInputApplicationCommandsJSONBody;
	// Check defaultPermissions
	// TODO(vladfrangu): This will be deprecated
	if ((existingCommand.default_permission ?? true) !== (casted.default_permission ?? true)) {
		differences.push({
			key: 'defaultPermission',
			original: String(existingCommand.default_permission ?? true),
			expected: String(casted.default_permission ?? true)
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
				const expectedType = optionTypeToPrettyName.get(option.type) ?? 'unknown; please contact Sapphire developers about this!';

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
	const expectedType = optionTypeToPrettyName.get(option.type) ?? 'unknown; please contact Sapphire developers about this!';

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
			original: optionTypeToPrettyName.get(existingOption.type) ?? 'unknown; please contact Sapphire developers about this!',
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

	// Check description
	if (existingOption.description !== option.description) {
		yield {
			key: `${keyPath(currentIndex)}.description`,
			original: existingOption.description,
			expected: option.description
		};
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
		const castedExisting = existingOption as APIApplicationCommandSubCommandOptions;
		const castedExpected = option as APIApplicationCommandSubCommandOptions;

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
						const expectedType = optionTypeToPrettyName.get(option.type) ?? 'unknown; please contact Sapphire developers about this!';

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

	// TODO(vladfrangu): publish discord-api-types already, so many new types to be had and validated >.> (min/max_value, autocomplete)
}
