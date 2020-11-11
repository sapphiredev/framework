import type { Precondition } from '../structures/Precondition';
import { UserError } from './UserError';

// eslint-disable-next-line @typescript-eslint/ban-types
export type PreconditionErrorExtras = object | null;

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
