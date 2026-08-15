import type { InteractionContextType } from 'discord.js';
import type { CommandDifference } from './_shared';

export function* checkInteractionContextTypes(
	existingContexts?: InteractionContextType[],
	newContexts?: InteractionContextType[]
): Generator<CommandDifference> {
	// 0. No existing contexts and now we have contexts
	if (!existingContexts && newContexts?.length) {
		yield {
			key: 'contexts',
			original: 'no contexts present',
			expected: 'contexts present'
		};
	}
	// 1. Existing contexts and now we have no contexts
	else if (existingContexts?.length && !newContexts?.length) {
		yield {
			key: 'contexts',
			original: 'contexts present',
			expected: 'no contexts present'
		};
	}
	// 2. Maybe changes in order or additions, log
	else if (newContexts?.length) {
		const existingContextSorted = existingContexts?.toSorted() ?? [];
		const newContextSorted = newContexts?.toSorted() ?? [];
		let index = 0;

		for (const newContext of newContextSorted) {
			const currentIndex = index++;

			if (existingContextSorted[currentIndex] !== newContext) {
				yield {
					key: `contexts[${currentIndex}]`,
					original: `contexts type ${existingContextSorted[currentIndex]}`,
					expected: `contexts type ${newContext}`
				};
			}
		}

		if (index < existingContextSorted.length) {
			let type: InteractionContextType;

			while ((type = existingContextSorted[index]) !== undefined) {
				yield {
					key: `contexts[${index}]`,
					original: `context ${type} present`,
					expected: `no context present`
				};

				index++;
			}
		}
	}
}
