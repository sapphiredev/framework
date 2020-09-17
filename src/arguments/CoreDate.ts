import type { PieceContext } from '@sapphire/pieces';
import { Argument, ArgumentContext, ArgumentResult } from '../lib/structures/Argument';

export class CoreArgument extends Argument<Date> {
	public constructor(context: PieceContext) {
		super(context, { name: 'date' });
	}

	public run(argument: string, context: ArgumentContext): ArgumentResult<Date> {
		const parsed = new Date(argument);
		const time = parsed.getTime();

		if (Number.isNaN(time)) {
			return this.error(argument, 'ArgumentDateInvalidNumber', 'The argument did not resolve to a valid date.');
		}
		if (typeof context.minimum === 'number' && time < context.minimum) {
			return this.error(argument, 'ArgumentDateTooSmall', 'The argument is too small.');
		}
		if (typeof context.maximum === 'number' && time > context.maximum) {
			return this.error(argument, 'ArgumentDateTooBig', 'The argument is too big.');
		}

		return this.ok(parsed);
	}
}
