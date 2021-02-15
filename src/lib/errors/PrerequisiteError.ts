import type { Prerequisite } from '../structures/Prerequisite';
import { UserError } from './UserError';

/**
 * Errors thrown by preconditions
 * @property name This will be `'PreconditionError'` and can be used to distinguish the type of error when any error gets thrown
 */
export class PrerequisiteError extends UserError {
	public readonly prerequisite: Prerequisite;

	public constructor(options: PrerequisiteError.Options) {
		super({ ...options, identifier: options.identifier ?? options.prerequisite.name });
		this.prerequisite = options.prerequisite;
	}

	// eslint-disable-next-line @typescript-eslint/class-literal-property-style
	public get name(): string {
		return 'PreconditionError';
	}
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace PrerequisiteError {
	/**
	 * The options for [[PreconditionError]].
	 * @since 1.0.0
	 */
	export interface Options extends Omit<UserError.Options, 'identifier'> {
		/**
		 * The precondition that caused the error.
		 * @since 1.0.0
		 */
		prerequisite: Prerequisite;

		/**
		 * The identifier.
		 * @since 1.0.0
		 * @default prerequisite.name
		 */
		identifier?: string;
	}
}
