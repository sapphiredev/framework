import { Store } from '@sapphire/pieces';
import type { Interaction } from 'discord.js';
import { isSome } from '../parsers/Maybe';
import { err, fromAsync, isErr, Result } from '../parsers/Result';
import { Events } from '../types/Events';
import { InteractionHandler, InteractionHandlerTypes } from './InteractionHandler';

export class InteractionHandlerStore extends Store<InteractionHandler> {
	public constructor() {
		super(InteractionHandler as any, { name: 'interaction-handlers' });
	}

	public async run(interaction: Interaction) {
		// Early-exit for optimization
		if (this.size === 0) return;

		const promises = [];

		// Iterate through every registered handler
		for (const handler of this.values()) {
			const filter = InteractionHandlerFilters.get(handler.interactionHandlerType);

			// If the filter is missing (we don't support it / someone hasn't registered it manually while waiting for us to implement it),
			// or it doesn't match the expected handler type, skip the handler
			if (!filter?.(interaction)) continue;

			// Get the result of the `parse` method in the handler
			const result = await fromAsync(() => handler.parse(interaction));

			if (isErr(result)) {
				// If the `parse` method threw an error (spoiler: please don't), skip the handler
				this.container.client.emit(Events.InteractionHandlerParseError, result.error, { interaction, handler });
				continue;
			}

			const finalValue = result.value;

			// If the `parse` method returned a `Some` (whatever that `Some`'s value is, it should be handled)
			if (isSome(finalValue)) {
				// Schedule the run of the handler method
				const promise = fromAsync(() => handler.run(interaction, finalValue.value)).then((res) => {
					return isErr(res) ? err({ handler, error: res.error }) : res;
				});

				promises.push(promise);
			}
		}

		// Yet another early exit
		if (promises.length === 0) return;

		const results = await Promise.allSettled(promises);

		for (const result of results) {
			if (result.status === 'rejected') {
				const res = result.reason as Result<
					unknown,
					{
						error: Error;
						handler: InteractionHandler;
					}
				>;

				const value = res.error!;

				this.container.client.emit(Events.InteractionHandlerError, value.error, { interaction, handler: value.handler });
			}
		}
	}
}

export const InteractionHandlerFilters = new Map<InteractionHandlerTypes, (interaction: Interaction) => boolean>([
	[InteractionHandlerTypes.Button, (interaction) => interaction.isButton()],
	[InteractionHandlerTypes.SelectMenu, (interaction) => interaction.isSelectMenu()],

	[InteractionHandlerTypes.MessageComponent, (interaction) => interaction.isMessageComponent()]
]);
