import { Store } from '@sapphire/pieces';
import type { Interaction } from 'discord.js';
import { isSome } from '../parsers/Maybe';
import { InteractionHandler, InteractionHandlerTypes } from './InteractionHandler';

export class InteractionHandlerStore extends Store<InteractionHandler> {
	public constructor() {
		super(InteractionHandler as any, { name: 'interactionHandlers' });
	}

	public async run(interaction: Interaction) {
		// Early-exit for optimization
		if (this.size === 0) return;

		const promises = [];

		// Iterate through every registered handler
		for (const handler of this.values()) {
			// TODO: this really needs to be optimized, but I don't know how right now :c
			const filter = InteractionHandlerFilters.get(handler.interactionHandlerType);

			// If the filter is missing (we don't support it / someone hasn't registered it manually while waiting for us to implement it),
			// or it doesn't match the expected handler type, skip the handler
			if (!filter?.(interaction)) continue;

			try {
				// Get the result of the `parse` method in the handler
				const result = await handler.parse(interaction);

				// If the `parse` method returned a `Some` (whatever that `Some`'s value is, it should be handled)
				if (isSome(result)) {
					// Schedule the run of the handler method
					promises.push(handler.run(interaction, result.value));
				}
			} catch (err) {
				// If the `parse` method threw an error (spoiler: please don't), skip the handler
				// TODO: Emit an event (interactionHandlerParseError) that the parse method errored out
				continue;
			}
		}

		// yet another early exit
		if (promises.length === 0) return;

		const results = await Promise.allSettled(promises);

		for (const result of results) {
			if (result.status === 'rejected') {
				// TODO: emit an `interactionHandlerError` event
			}
		}
	}
}

export const InteractionHandlerFilters = new Map<InteractionHandlerTypes, (interaction: Interaction) => boolean>([
	[InteractionHandlerTypes.Button, (interaction) => interaction.isButton()],
	[InteractionHandlerTypes.SelectMenu, (interaction) => interaction.isSelectMenu()],

	[InteractionHandlerTypes.MessageComponent, (interaction) => interaction.isMessageComponent()]
]);
