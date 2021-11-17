import { ApplicationCommandType, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v9';
import type { InternalAPICall } from './ApplicationCommandRegistry';

export function getCommandDifferences(existingCommand: RESTPostAPIChatInputApplicationCommandsJSONBody, apiData: InternalAPICall['builtData']) {
	// We don't care about context menus here
	if ((apiData.type ?? ApplicationCommandType.ChatInput) !== ApplicationCommandType.ChatInput) {
		return [];
	}

	const differences: CommandDifference[] = [];
	const casted = apiData as RESTPostAPIChatInputApplicationCommandsJSONBody;

	// Check defaultPermissions
	// TODO(vladfrangu): This will be deprecated
	if (Reflect.has(casted, 'default_permission') && existingCommand.default_permission !== casted.default_permission) {
		differences.push({
			key: 'defaultPermissions',
			original: String(existingCommand.default_permission),
			expected: String(casted.default_permission)
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
	// 2. Iterate over each option and see what's different
	else {
		for (const [index, option] of casted.options!.entries()) {
		}
	}

	return differences;
}

interface CommandDifference {
	key: string;
	expected: string;
	original: string;
}
