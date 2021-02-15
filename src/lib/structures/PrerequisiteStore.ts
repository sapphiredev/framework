import type { Message } from 'discord.js';
import { ok } from '../parsers/Result';
import type { PreCommandRunPayload } from '../types/Events';
import { PriorityPieceStore } from './base/PriorityPieceStore';
import type { Command } from './Command';
import { AsyncPrerequisiteResult, Prerequisite } from './Prerequisite';

export class PrerequisiteStore extends PriorityPieceStore<Prerequisite> {
	public constructor() {
		super(Prerequisite as any, { name: 'prerequisites' });
	}

	public async run(message: Message, command: Command, context: PreCommandRunPayload): AsyncPrerequisiteResult {
		for (const precondition of this.sortedPieces) {
			const result = await precondition.run(message, command, context);
			if (!result.success) return result;
		}

		return ok();
	}
}
