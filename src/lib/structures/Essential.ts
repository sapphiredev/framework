import type { Awaited } from '@sapphire/pieces';
import type { Message } from 'discord.js';
import { EssentialError } from '../errors/EssentialError';
import { err, ok, Result } from '../parsers/Result';
import type { PreCommandRunPayload } from '../types/Events';
import { PriorityPiece } from './base/PriorityPiece';
import type { Command } from './Command';

export type EssentialResult = Awaited<Result<unknown, EssentialError>>;
export type AsyncEssentialResult = Promise<Result<unknown, EssentialError>>;
export interface EssentialContext extends PreCommandRunPayload {}

export abstract class Essential extends PriorityPiece {
	public abstract run(message: Message, command: Command, context: EssentialContext): EssentialResult;

	public ok(): EssentialResult {
		return ok();
	}

	/**
	 * Constructs a [[PreconditionError]] with the precondition parameter set to `this`.
	 * @param options The information.
	 */
	public error(options: Omit<EssentialError.Options, 'essential'> = {}): EssentialResult {
		return err(new EssentialError({ essential: this, ...options }));
	}
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Essential {
	export type Result = EssentialResult;
	export type AsyncResult = AsyncEssentialResult;
	export interface Context extends PreCommandRunPayload {}
}
