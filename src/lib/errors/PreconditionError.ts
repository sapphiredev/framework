import type { Precondition } from '../structures/Precondition';
import { UserError } from './UserError';

// eslint-disable-next-line @typescript-eslint/ban-types
export type PreconditionErrorExtras = object | null;

/**
 * Errors thrown by preconditions
 * @property name This will be `'PreconditionError'` and can be used to distinguish the type of error when any error gets thrown
 */
export class PreconditionError extends UserError {
	public readonly precondition: Precondition;
	public readonly extras: PreconditionErrorExtras;

	public constructor(argument: Precondition, type: string, message: string, extras: PreconditionErrorExtras = null) {
		super(type, message);
		this.name = 'PreconditionError';
		this.precondition = argument;
		this.extras = extras;
	}
}
