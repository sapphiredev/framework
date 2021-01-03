import type { PieceContext } from '@sapphire/pieces';
import { Argument, ArgumentContext, ArgumentResult } from '../lib/structures/Argument';

export class CoreArgument extends Argument<string> {
	public constructor(context: PieceContext) {
		super(context, { name: 'string' });
	}

	public run(argument: string, context: ArgumentContext): ArgumentResult<string> {
		if (typeof context.minimum === 'number' && argument.length < context.minimum) {
			return this.error(argument, 'ArgumentStringTooShort', `The argument must be greater than ${context.minimum} characters.`);
		}
		if (typeof context.maximum === 'number' && argument.length > context.maximum) {
			return this.error(argument, 'ArgumentStringTooLong', `The argument must be less than ${context.maximum} characters.`);
		}

		return this.ok(argument);
	}
}
