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
		let index = 0;

		for (const newContext of newContexts) {
			const currentIndex = index++;

			if (existingContexts![currentIndex] !== newContext) {
				yield {
					key: `contexts[${currentIndex}]`,
					original: `contexts type ${existingContexts?.[currentIndex]}`,
					expected: `contexts type ${newContext}`
				};
			}
		}

		if (index < existingContexts!.length) {
			let type: InteractionContextType;

			while ((type = existingContexts![index]) !== undefined) {
				yield {
					key: `contexts[${index}]`,
					original: 'context present',
					expected: `no context present`
				};

				index++;
			}
		}
	}
}
