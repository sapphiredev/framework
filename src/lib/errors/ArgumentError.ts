import type { IArgument } from '../structures/Argument';
import { UserError } from './UserError';

/**
 * Errors thrown by the argument parser
 *
 * @remarks Available since 1.0.0
 */
export class ArgumentError<T = unknown> extends UserError {
	public readonly argument: IArgument<T>;

	public readonly parameter: string;

	public constructor(options: ArgumentError.Options<T>) {
		super({ ...options, identifier: options.identifier ?? options.argument.name });
		this.argument = options.argument;
		this.parameter = options.parameter;
	}

	/**
	 * This will be `'ArgumentError'` and can be used to distinguish the type of error when any error gets thrown.
	 */
	public override get name(): string {
		return 'ArgumentError';
	}
}

export declare namespace ArgumentError {
	/**
	 * The options for {@link ArgumentError}.
	 *
	 * @remarks Available since 1.0.0
	 */
	export interface Options<T> extends Omit<UserError.Options, 'identifier'> {
		/**
		 * The argument that caused the error.
		 *
		 * @remarks Available since 1.0.0
		 */
		argument: IArgument<T>;

		/**
		 * The identifier.
		 *
		 * @remarks Available since 1.0.0
		 * @defaultValue argument.name
		 */
		identifier?: string;

		/**
		 * The parameter that failed to be parsed.
		 *
		 * @remarks Available since 1.0.0
		 */
		parameter: string;
	}
}
