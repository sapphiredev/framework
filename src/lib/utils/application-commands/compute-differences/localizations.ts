import type { LocalizationMap } from 'discord-api-types/v10';
import type { CommandDifference } from './_shared';

export function* checkLocalizations({
	localeMapName,
	localePresentMessage,
	localeMissingMessage,
	originalLocalizedDescriptions,
	expectedLocalizedDescriptions
}: {
	localeMapName: string;
	localePresentMessage: string;
	localeMissingMessage: string;
	originalLocalizedDescriptions?: LocalizationMap | null;
	expectedLocalizedDescriptions?: LocalizationMap | null;
}) {
	if (!originalLocalizedDescriptions && expectedLocalizedDescriptions) {
		yield {
			key: localeMapName,
			original: localeMissingMessage,
			expected: localePresentMessage
		};
	} else if (originalLocalizedDescriptions && !expectedLocalizedDescriptions) {
		yield {
			key: localeMapName,
			original: localePresentMessage,
			expected: localeMissingMessage
		};
	} else if (originalLocalizedDescriptions && expectedLocalizedDescriptions) {
		yield* reportLocalizationMapDifferences(originalLocalizedDescriptions, expectedLocalizedDescriptions, localeMapName);
	}
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
