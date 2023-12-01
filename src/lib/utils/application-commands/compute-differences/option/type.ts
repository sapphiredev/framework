import type { ApplicationCommandOptionType } from 'discord-api-types/v10';
import { optionTypeToPrettyName, type CommandDifference } from '../_shared';

export function* checkOptionType({
	key,
	expectedType,
	originalType
}: {
	key: string;
	originalType: ApplicationCommandOptionType;
	expectedType: ApplicationCommandOptionType;
}): Generator<CommandDifference> {
	const expectedTypeString =
		optionTypeToPrettyName.get(expectedType) ?? `unknown (${expectedType}); please contact Sapphire developers about this!`;

	if (originalType !== expectedType) {
		yield {
			key,
			original: optionTypeToPrettyName.get(originalType) ?? `unknown (${originalType}); please contact Sapphire developers about this!`,
			expected: expectedTypeString
		};
	}
}
