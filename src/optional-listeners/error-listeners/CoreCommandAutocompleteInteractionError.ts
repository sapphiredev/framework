import { Listener } from '../../lib/structures/Listener';
import { AutocompleteInteractionPayload, Events } from '../../lib/types/Events';

export class CoreEvent extends Listener<typeof Events.CommandAutocompleteInteractionError> {
	public constructor(context: Listener.Context) {
		super(context, { event: Events.CommandAutocompleteInteractionError });
	}

	public run(error: unknown, context: AutocompleteInteractionPayload) {
		const { name, location } = context.command;
		this.container.logger.error(
			`Encountered error while handling an autocomplete run method on command "${name}" at path "${location.full}"`,
			error
		);
	}
}
