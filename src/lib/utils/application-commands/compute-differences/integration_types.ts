import type { ApplicationIntegrationType } from 'discord.js';
import type { CommandDifference } from './_shared';

export function* checkIntegrationTypes(
	existingIntegrationTypes?: ApplicationIntegrationType[],
	newIntegrationTypes?: ApplicationIntegrationType[]
): Generator<CommandDifference> {
	// 0. No existing integration types and now we have integration types
	if (!existingIntegrationTypes?.length && newIntegrationTypes?.length) {
		yield {
			key: 'integrationTypes',
			original: 'no integration types present',
			expected: 'integration types present'
		};
	}
	// 1. Existing integration types and now we have no integration types
	else if (existingIntegrationTypes?.length && !newIntegrationTypes?.length) {
		yield {
			key: 'integrationTypes',
			original: 'integration types present',
			expected: 'no integration types present'
		};
	}
	// 2. Maybe changes in order or additions, log
	else if (newIntegrationTypes?.length) {
		const sortedExistingIntegrationTypes = [...existingIntegrationTypes!].sort((first, second) => first - second);
		const sortedNewIntegrationTypes = [...newIntegrationTypes].sort((first, second) => first - second);
		let index = 0;

		for (const newIntegrationType of sortedNewIntegrationTypes) {
			const currentIndex = index++;

			if (sortedExistingIntegrationTypes[currentIndex] !== newIntegrationType) {
				yield {
					key: `integrationTypes[${currentIndex}]`,
					original: `integration type ${sortedExistingIntegrationTypes[currentIndex]}`,
					expected: `integration type ${newIntegrationType}`
				};
			}
		}

		if (index < sortedExistingIntegrationTypes.length) {
			let type: ApplicationIntegrationType;

			while ((type = sortedExistingIntegrationTypes[index]) !== undefined) {
				yield {
					key: `integrationTypes[${index}]`,
					original: `integration type ${type} present`,
					expected: 'no integration type present'
				};

				index++;
			}
		}
	}
}
