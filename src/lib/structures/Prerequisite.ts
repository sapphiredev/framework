import type { Awaited } from '@sapphire/pieces';
import type { Message } from 'discord.js';
import { PrerequisiteError } from '../errors/PrerequisiteError';
import { err, ok, Result } from '../parsers/Result';
import type { PreCommandRunPayload } from '../types/Events';
import { PriorityPiece } from './base/PriorityPiece';
import type { Command } from './Command';

export type PrerequisiteResult = Awaited<Result<unknown, PrerequisiteError>>;
export type AsyncPrerequisiteResult = Promise<Result<unknown, PrerequisiteError>>;

export abstract class Prerequisite extends PriorityPiece {
	public abstract run(message: Message, command: Command, context: PreCommandRunPayload): PrerequisiteResult;

	public ok(): PrerequisiteResult {
		return ok();
	}

	/**
	 * Constructs a [[PreconditionError]] with the precondition parameter set to `this`.
	 * @param options The information.
	 */
	public error(options: Omit<PrerequisiteError.Options, 'prerequisite'> = {}): PrerequisiteResult {
		return err(new PrerequisiteError({ prerequisite: this, ...options }));
	}
}
