import type { PieceContext } from '@sapphire/pieces';
import type { Message } from 'discord.js';
import { Identifiers } from '../lib/errors/Identifiers';
import type { Command } from '../lib/structures/Command';
import { Precondition, PreconditionContext, PreconditionResult } from '../lib/structures/Precondition';

export class CorePrecondition extends Precondition {
	public constructor(context: PieceContext) {
		super(context, { position: 10 });
	}

	public run(_: Message, command: Command, context: PreconditionContext): PreconditionResult {
		return command.enabled ? this.ok() : this.error({ identifier: Identifiers.CommandDisabled, message: 'This command is disabled.', context });
	}
}
