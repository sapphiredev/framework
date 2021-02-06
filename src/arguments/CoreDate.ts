import type { PieceContext } from '@sapphire/pieces';
import { Identifiers } from '../lib/errors/Identifiers';
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
				message: 'The argument did not resolve to a valid date.',
				context
			});
		}

		if (typeof context.minimum === 'number' && time < context.minimum) {
			return this.error({ parameter, identifier: Identifiers.ArgumentDateTooSmall, message: 'The argument is too small.', context });
		}

		if (typeof context.maximum === 'number' && time > context.maximum) {
			return this.error({ parameter, identifier: Identifiers.ArgumentDateTooBig, message: 'The argument is too big.', context });
		}

		return this.ok(parsed);
	}
}
