import { Store } from '@sapphire/pieces';
import { Result } from '@sapphire/result';
import type { Interaction } from 'discord.js';
import { Events } from '../types/Events';
import { InteractionHandler, InteractionHandlerTypes, type InteractionHandlerOptions } from './InteractionHandler';

export class InteractionHandlerStore extends Store<InteractionHandler> {
	public constructor() {
		super(InteractionHandler as any, { name: 'interaction-handlers' });
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

			if (result.isErr()) {
				// If the `parse` method threw an error (spoiler: please don't), skip the handler
				this.container.client.emit(Events.InteractionHandlerParseError, result.unwrapErr(), { interaction, handler });
				continue;
			}

			// If the `parse` method returned a `Some` (whatever that `Some`'s value is, it should be handled)
			if (result.unwrap()) {
				// Schedule the run of the handler method
				const promise = Result.fromAsync(() => handler.run(interaction, result.unwrap())).then((res) => {
					return res.mapErr((error) => ({ handler, error }));
				});

				promises.push(promise);
			}
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

			if (!res.isErr()) continue;

			res.inspectErr((value) =>
				this.container.client.emit(Events.InteractionHandlerError, value.error, { interaction, handler: value.handler })
			);
		}

		return true;
	}
}

export const InteractionHandlerFilters = new Map<InteractionHandlerTypes, (interaction: Interaction) => boolean>([
	[InteractionHandlerTypes.Button, (interaction) => interaction.isButton()],
	[InteractionHandlerTypes.SelectMenu, (interaction) => interaction.isSelectMenu()],
	[InteractionHandlerTypes.ModalSubmit, (interaction) => interaction.isModalSubmit()],

	[InteractionHandlerTypes.MessageComponent, (interaction) => interaction.isMessageComponent()],
	[InteractionHandlerTypes.Autocomplete, (Interaction) => Interaction.isAutocomplete()]
]);
