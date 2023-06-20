import { Store } from '@sapphire/pieces';
import { Result, type Option } from '@sapphire/result';
import type { Interaction } from 'discord.js';
import { Events } from '../types/Events';
import { InteractionHandler, InteractionHandlerTypes, type InteractionHandlerOptions } from './InteractionHandler';

export class InteractionHandlerStore extends Store<InteractionHandler> {
	public constructor() {
		super(InteractionHandler, { name: 'interaction-handlers' });
	}

	public async run(interaction: Interaction) {
		// Early-exit for optimization
		if (this.size === 0) return false;

		const promises: Promise<Result<unknown, { handler: InteractionHandler<InteractionHandlerOptions>; error: unknown }>>[] = [];

		// Iterate through every registered handler
		for (const handler of this.values()) {
			const filter = InteractionHandlerFilters.get(handler.interactionHandlerType);

			// If the filter is missing (we don't support it or someone didn't register it manually while waiting for us to implement it),
			// or it doesn't match the expected handler type, skip the handler
			if (!filter?.(interaction)) continue;

			// Get the result of the `parse` method in the handler
			const result = await Result.fromAsync(() => handler.parse(interaction));
			result.match({
				ok: (option) => {
					// Emit an event to the user to let them know `parse` was successful
					this.container.client.emit(Events.InteractionHandlerParseSuccess, option, { interaction, handler });

					option.match({
						// If the `parse` method returned a `Some` (whatever that `Some`'s value is, it should be handled)
						some: (value) => {
							// Emit an event to the user to let them know parse was successful and `some` was returned.
							this.container.client.emit(Events.InteractionHandlerParseSome, option as Option.Some<typeof value>, {
								interaction,
								handler,
								value
							});

							// Schedule the run of the handler method
							const promise = Result.fromAsync(() => handler.run(interaction, value)) //
								.then((res) => res.mapErr((error) => ({ handler, error })));

							promises.push(promise);
						},
						// Emit an event to the user to let them know parse was successful and `none` was returned.
						none: () => this.container.client.emit(Events.InteractionHandlerParseNone, option as Option.None, { interaction, handler })
					});
				},
				err: (error) => {
					// If the `parse` method threw an error (spoiler: please don't), skip the handler
					this.container.client.emit(Events.InteractionHandlerParseError, error, { interaction, handler });
				}
			});
		}

		// Yet another early exit
		if (promises.length === 0) return false;

		const results = await Promise.allSettled(promises);

		for (const result of results) {
			const res = (
				result as PromiseFulfilledResult<
					Result<
						unknown,
						{
							error: Error;
							handler: InteractionHandler;
						}
					>
				>
			).value;

			res.inspectErr((value) =>
				this.container.client.emit(Events.InteractionHandlerError, value.error, { interaction, handler: value.handler })
			);
		}

		return true;
	}
}

export const InteractionHandlerFilters = new Map<InteractionHandlerTypes, (interaction: Interaction) => boolean>([
	[InteractionHandlerTypes.Button, (interaction) => interaction.isButton()],
	[InteractionHandlerTypes.SelectMenu, (interaction) => interaction.isAnySelectMenu()],
	[InteractionHandlerTypes.ModalSubmit, (interaction) => interaction.isModalSubmit()],

	[InteractionHandlerTypes.MessageComponent, (interaction) => interaction.isMessageComponent()],
	[InteractionHandlerTypes.Autocomplete, (Interaction) => Interaction.isAutocomplete()]
]);
