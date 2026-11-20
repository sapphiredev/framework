import type { IArgument } from '../structures/Argument';
import { UserError } from './UserError';

/**
 * Errors thrown by the argument parser
 *
 * @since 1.0.0
 * @property name This will be `'ArgumentError'` and can be used to distinguish the type of error when any error gets thrown
 */
export class ArgumentError<T = unknown> extends UserError {
	public readonly argument: IArgument<T>;

	public readonly parameter: string;

	public constructor(options: ArgumentError.Options<T>) {
		super({ ...options, identifier: options.identifier ?? options.argument.name });
		this.argument = options.argument;
		this.parameter = options.parameter;
	}

	public override get name(): string {
		return 'ArgumentError';
	}
}

export declare namespace ArgumentError {
	/**
	 * The options for {@link ArgumentError}.
	 *
	 * @since 1.0.0
	 */
	export interface Options<T> extends Omit<UserError.Options, 'identifier'> {
		/**
		 * The argument that caused the error.
		 *
		 * @since 1.0.0
		 */
		argument: IArgument<T>;

		/**
		 * The identifier.
		 *
		 * @since 1.0.0
		 * @default argument.name
		 */
		identifier?: string;

		/**
		 * The parameter that failed to be parsed.
		 *
		 * @since 1.0.0
		 */
		parameter: string;
	}
}
