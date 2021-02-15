import type { PieceContext } from '@sapphire/pieces';
import type { Message } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import type { Command } from '../lib/structures/Command';
import { Prerequisite, PrerequisiteResult } from '../lib/structures/Prerequisite';
import type { PreCommandRunPayload } from '../lib/types/Events';

export class CorePrecondition extends Prerequisite {
	public constructor(context: PieceContext) {
		super(context, { position: 10 });
	}

	public run(_: Message, command: Command, context: PreCommandRunPayload): PrerequisiteResult {
		return command.enabled ? this.ok() : this.error({ identifier: Identifiers.CommandDisabled, message: 'This command is disabled.', context });
	}
}
