import type { PieceContext } from '@sapphire/pieces';
import { Argument, ArgumentResult } from '../lib/structures/Argument';
import type { BoundedArgumentContext } from '../lib/types/Arguments';

export class CoreArgument extends Argument<Date> {
	public constructor(context: PieceContext) {
		super(context, { name: 'date' });
	}

	public run(parameter: string, context: BoundedArgumentContext): ArgumentResult<Date> {
		const parsed = new Date(parameter);
		const time = parsed.getTime();

		if (Number.isNaN(time)) {
			return this.error({
				parameter,
				identifier: 'ArgumentDateInvalidNumber',
				message: 'The argument did not resolve to a valid date.',
				context
			});
		}

		if (context.minimum && time < context.minimum) {
			return this.error({ parameter, identifier: 'ArgumentDateTooSmall', message: 'The argument is too small.', context });
		}

		if (context.maximum && time > context.maximum) {
			return this.error({ parameter, identifier: 'ArgumentDateTooBig', message: 'The argument is too big.', context });
		}

		return this.ok(parsed);
	}
}
