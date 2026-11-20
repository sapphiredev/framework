import type { Precondition } from '../structures/Precondition';
import { UserError } from './UserError';

/**
 * Errors thrown by preconditions
 *
 */
export class PreconditionError extends UserError {
	public readonly precondition: Precondition;

	public constructor(options: PreconditionError.Options) {
		super({ ...options, identifier: options.identifier ?? options.precondition.name });
		this.precondition = options.precondition;
	}

	/**
	 * This will be `'PreconditionError'` and can be used to distinguish the type of error when any error gets thrown.
	 */
	public override get name(): string {
		return 'PreconditionError';
	}
}

export declare namespace PreconditionError {
	/**
	 * The options for {@link PreconditionError}.
	 *
	 * @remarks Available since 1.0.0
	 */
	export interface Options extends Omit<UserError.Options, 'identifier'> {
		/**
		 * The identifier.
		 *
		 * @remarks Available since 1.0.0
		 * @defaultValue precondition.name
		 */
		identifier?: string;

		/**
		 * The precondition that caused the error.
		 *
		 * @remarks Available since 1.0.0
		 */
		precondition: Precondition;
	}
}
