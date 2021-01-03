import type { PieceContext } from '@sapphire/pieces';
import { Argument, ArgumentContext, ArgumentResult } from '../lib/structures/Argument';

export class CoreArgument extends Argument<number> {
	public constructor(context: PieceContext) {
		super(context, { name: 'float' });
	}

	public run(argument: string, context: ArgumentContext): ArgumentResult<number> {
		const parsed = Number(argument);

		if (Number.isNaN(parsed)) {
			return this.error(argument, 'ArgumentFloatInvalidFloat', 'The argument did not resolve to a valid floating point number.');
		}
		if (typeof context.minimum === 'number' && parsed < context.minimum) {
			return this.error(argument, 'ArgumentFloatTooSmall', `The argument must be greater than ${context.minimum}.`);
		}
		if (typeof context.maximum === 'number' && parsed > context.maximum) {
			return this.error(argument, 'ArgumentFloatTooBig', `The argument must be less than ${context.maximum}.`);
		}

		return this.ok(parsed);
	}
}
