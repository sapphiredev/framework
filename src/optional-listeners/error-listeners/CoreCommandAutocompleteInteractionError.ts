import type { PieceContext } from '@sapphire/pieces';
import { Listener } from '../../lib/structures/Listener';
import { AutocompleteInteractionPayload, SapphireEvents } from '../../lib/types/Events';

export class CoreEvent extends Listener<typeof SapphireEvents.CommandAutocompleteInteractionError> {
	public constructor(context: PieceContext) {
		super(context, { event: SapphireEvents.CommandAutocompleteInteractionError });
	}

	public run(error: unknown, context: AutocompleteInteractionPayload) {
		const { name, location } = context.command;
		this.container.logger.error(
			`Encountered error while handling an autocomplete run method on command "${name}" at path "${location.full}"`,
			error
		);
	}
}
