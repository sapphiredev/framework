import type { PieceContext } from '@sapphire/pieces';
import { UserError } from '../../lib/errors/UserError';
import { isErr } from '../../lib/parsers/Result';
import { Event } from '../../lib/structures/Event';
import { Events, PreCommandRunPayload } from '../../lib/types/Events';

export class CoreEvent extends Event<Events.PreCommandRun> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.PreCommandRun });
	}

	public async run(payload: PreCommandRunPayload) {
		const { message, command, parameters, context } = payload;
		if (!command.enabled) {
			message.client.emit(
				Events.CommandDenied,
				new UserError({ identifier: 'CommandDisabled', message: 'This command is disabled.', context: payload }),
				{
					message,
					command,
					parameters,
					context
				}
			);
			return;
		}

		const result = await command.preconditions.run(message, command, { command });
		if (isErr(result)) {
			message.client.emit(Events.CommandDenied, result.error, payload);
		} else {
			message.client.emit(Events.CommandAccepted, payload);
		}
	}
}
