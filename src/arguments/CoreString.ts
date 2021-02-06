import type { PieceContext } from '@sapphire/pieces';
import { Argument, ArgumentResult } from '../lib/structures/Argument';
import type { BoundedArgumentContext } from '../lib/types/Arguments';

export class CoreArgument extends Argument<string> {
	public constructor(context: PieceContext) {
		super(context, { name: 'string' });
	}

	public run(parameter: string, context: BoundedArgumentContext): ArgumentResult<string> {
		const { minimum, maximum } = context;

		if (minimum && parameter.length < minimum) {
			return this.error({
				parameter,
				identifier: 'ArgumentStringTooShort',
				message: `The argument must be greater than ${minimum} characters.`,
				context
			});
		}

		if (maximum && parameter.length > maximum) {
			return this.error({
				parameter,
				identifier: 'ArgumentStringTooLong',
				message: `The argument must be less than ${maximum} characters.`,
				context
			});
		}

		return this.ok(parameter);
	}
}
