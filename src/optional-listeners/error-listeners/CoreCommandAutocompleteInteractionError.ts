import { Listener } from '../../lib/structures/Listener';
import { Events, type AutocompleteInteractionPayload } from '../../lib/types/Events';

export class CoreListener extends Listener<typeof Events.CommandAutocompleteInteractionError> {
	public constructor(context: Listener.LoaderContext) {
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
