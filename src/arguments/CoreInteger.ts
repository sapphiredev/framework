import type { PieceContext } from '@sapphire/pieces';
import { Argument, ArgumentContext, ArgumentResult } from '../lib/structures/Argument';

export class CoreArgument extends Argument<number> {
	public constructor(context: PieceContext) {
		super(context, { name: 'integer' });
	}

	public run(argument: string, context: ArgumentContext): ArgumentResult<number> {
		const parsed = Number(argument);

		if (!Number.isInteger(parsed)) {
			return this.error(argument, 'ArgumentIntegerInvalidNumber', 'The argument did not resolve to an integer.');
		}
		if (typeof context.minimum === 'number' && parsed < context.minimum) {
			return this.error(argument, 'ArgumentIntegerTooSmall', `The argument must be greater than ${context.minimum}.`);
		}
		if (typeof context.maximum === 'number' && parsed > context.maximum) {
			return this.error(argument, 'ArgumentIntegerTooBig', `The argument must be less than ${context.minimum}.`);
		}

		return this.ok(parsed);
	}
}
