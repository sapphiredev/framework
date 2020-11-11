import type { IArgument } from '../structures/Argument';
import { UserError } from './UserError';

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
