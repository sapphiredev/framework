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
		const sortedExistingContexts = [...existingContexts!].sort((first, second) => first - second);
		const sortedNewContexts = [...newContexts].sort((first, second) => first - second);
		let index = 0;

		for (const newContext of sortedNewContexts) {
			const currentIndex = index++;

			if (sortedExistingContexts[currentIndex] !== newContext) {
				yield {
					key: `contexts[${currentIndex}]`,
					original: `contexts type ${sortedExistingContexts[currentIndex]}`,
					expected: `contexts type ${newContext}`
				};
			}
		}

		if (index < sortedExistingContexts.length) {
			let type: InteractionContextType;

			while ((type = sortedExistingContexts[index]) !== undefined) {
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
