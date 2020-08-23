import type { Awaited, PieceContext } from '@sapphire/pieces';
import { UserError } from '../lib/errors/UserError';
import { Argument, ArgumentContext } from '../lib/structures/Argument';
import { err, ok, Result } from '../lib/utils/Result';

export class CoreArgument extends Argument {
	public constructor(context: PieceContext) {
		super(context, { name: 'integer' });
	}

	public run(argument: string, context: ArgumentContext): Awaited<Result<number, UserError>> {
		const parsed = Number(argument);

		if (!Number.isInteger(parsed)) {
			return err(new UserError('ArgumentNumberInvalidNumber', 'The argument did not resolve to an integer.'));
		}
		if (typeof context.minimum === 'number' && parsed < context.minimum) {
			return err(new UserError('ArgumentStringTooShort', 'The argument is too short.'));
		}
		if (typeof context.maximum === 'number' && parsed > context.maximum) {
			return err(new UserError('ArgumentStringTooLong', 'The argument is too long.'));
		}

		return ok(parsed);
	}
}
