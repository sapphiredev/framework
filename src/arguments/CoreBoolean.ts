import type { PieceContext } from '@sapphire/pieces';
import { err, ok, Result } from '../lib/parsers/Result';
import { Argument, ArgumentContext, ArgumentResult } from '../lib/structures/Argument';

const truths = ['1', 'true', '+', 't', 'yes', 'y'];
const falses = ['0', 'false', '-', 'f', 'no', 'n'];

export class CoreArgument extends Argument<boolean> {
	public constructor(context: PieceContext) {
		super(context, { name: 'boolean' });
	}

	public run(parameter: string, context: ArgumentContext): ArgumentResult<boolean> {
		const resolved = CoreArgument.resolve(parameter);
		if (resolved.success) return this.ok(resolved.value);
		return this.error({ parameter, message: resolved.error, context });
	}

	public static resolve(parameter: string): Result<boolean, string> {
		const boolean = parameter.toLowerCase();
		if (truths.includes(boolean)) return ok(true);
		if (falses.includes(boolean)) return ok(false);
		return err('The argument did not resolve to a boolean.');
	}
}
