import type { Essential } from '../structures/Essential';
import { UserError } from './UserError';

/**
 * Errors thrown by Essentials
 * @property name This will be `'EssentialError'` and can be used to distinguish the type of error when any error gets thrown
 */
export class EssentialError extends UserError {
	public readonly essential: Essential;

	public constructor(options: EssentialError.Options) {
		super({ ...options, identifier: options.identifier ?? options.essential.name });
		this.essential = options.essential;
	}

	// eslint-disable-next-line @typescript-eslint/class-literal-property-style
	public get name(): string {
		return 'EssentialError';
	}
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace EssentialError {
	/**
	 * The options for [[EssentialError]].
	 * @since 1.0.0
	 */
	export interface Options extends Omit<UserError.Options, 'identifier'> {
		/**
		 * The essential that caused the error.
		 * @since 1.0.0
		 */
		essential: Essential;

		/**
		 * The identifier.
		 * @since 1.0.0
		 * @default essential.name
		 */
		identifier?: string;
	}
}
