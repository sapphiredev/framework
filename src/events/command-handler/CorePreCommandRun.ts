import type { PieceContext } from '@sapphire/pieces';
import { UserError } from '../../lib/errors/UserError';
import { Event } from '../../lib/structures/Event';
import { Events, PreCommandRunPayload } from '../../lib/types/Events';
import { isErr } from '../../lib/parsers/Result';

export class CoreEvent extends Event<Events.PreCommandRun> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.PreCommandRun });
	}

	public async run({ message, command, parameters, context }: PreCommandRunPayload) {
		if (!command.enabled) {
			message.client.emit(Events.CommandDenied, new UserError('CommandDisabled', 'This command is disabled.'), {
				message,
				command,
				parameters,
				context
			});
			return;
		}
		const result = await command.preconditions.run(message, command);
		if (isErr(result)) {
			message.client.emit(Events.CommandDenied, result.error, { message, command, parameters, context });
		} else {
			message.client.emit(Events.CommandAccepted, { message, command, parameters, context });
		}
	}
}
