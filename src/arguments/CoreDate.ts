import type { PieceContext } from '@sapphire/pieces';
import { Identifiers } from '../lib/errors/Identifiers';
import { Argument, ArgumentContext, ArgumentResult } from '../lib/structures/Argument';
import { err, ok, Result } from '../lib/parsers/Result';

export class CoreArgument extends Argument<Date> {
	public constructor(context: PieceContext) {
		super(context, { name: 'date' });
	}

	public run(parameter: string, context: ArgumentContext): ArgumentResult<Date> {
		const resolved = CoreArgument.resolve(parameter, { minimum: context?.minimum, maximum: context?.maximum });
		if (resolved.success) return this.ok(resolved.value);

		if (resolved.error === Identifiers.ArgumentDateTooSmall)
			return this.error({ parameter, identifier: Identifiers.ArgumentDateTooSmall, message: 'The argument is too small.', context });

		if (resolved.error === Identifiers.ArgumentDateTooBig)
			return this.error({ parameter, identifier: Identifiers.ArgumentDateTooBig, message: 'The argument is too big.', context });

		return this.error({
			parameter,
			message: resolved.error,
			context
		});
	}

	public static resolve(parameter: string, options?: { minimum?: number; maximum?: number }): Result<Date, string> {
		const parsed = new Date(parameter);

		const time = parsed.getTime();
		if (Number.isNaN(time)) return err('The argument did not resolve to a valid date.');

		if (typeof options?.minimum === 'number' && time < options.minimum) return err(Identifiers.ArgumentDateTooSmall);
		if (typeof options?.maximum === 'number' && time > options.maximum) return err(Identifiers.ArgumentDateTooBig);

		return ok(parsed);
	}
}
