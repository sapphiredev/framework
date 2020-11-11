import type { IArgument } from '../structures/Argument';
import { UserError } from './UserError';

/**
 * Errors thrown by the argument parser
 * @property name This will be `'ArgumentError'` and can be used to distinguish the type of error when any error gets thrown
 */
export class ArgumentError<T> extends UserError {
	public readonly argument: IArgument<T>;
	public readonly parameter: string;

	public constructor(argument: IArgument<T>, parameter: string, type: string, message: string) {
		super(type, message);
		this.name = 'ArgumentError';
		this.argument = argument;
		this.parameter = parameter;
	}
}
