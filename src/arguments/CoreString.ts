import type { PieceContext } from '@sapphire/pieces';
import { Argument, ArgumentContext, ArgumentResult } from '../lib/structures/Argument';

export class CoreArgument extends Argument<string> {
	public constructor(context: PieceContext) {
		super(context, { name: 'string' });
	}

	public run(argument: string, context: ArgumentContext): ArgumentResult<string> {
		if (typeof context.minimum === 'number' && argument.length < context.minimum) {
			return this.error(argument, 'ArgumentStringTooShort', 'The argument is too short.');
		}
		if (typeof context.maximum === 'number' && argument.length > context.maximum) {
			return this.error(argument, 'ArgumentStringTooLong', 'The argument is too long.');
		}

		return this.ok(argument);
	}
}
