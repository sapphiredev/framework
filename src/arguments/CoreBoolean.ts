import type { PieceContext } from '@sapphire/pieces';
import { Argument, ArgumentContext, ArgumentResult } from '../lib/structures/Argument';

const truths = ['1', 'true', '+', 't', 'yes', 'y'];
const falses = ['0', 'false', '-', 'f', 'no', 'n'];

export class CoreArgument extends Argument<boolean> {
	public constructor(context: PieceContext) {
		super(context, { name: 'boolean' });
	}

	public run(parameter: string, context: ArgumentContext): ArgumentResult<boolean> {
		const boolean = parameter.toLowerCase();
		if (truths.includes(boolean)) return this.ok(true);
		if (falses.includes(boolean)) return this.ok(false);

		return this.error({ parameter, identifier: 'ArgumentBooleanInvalidBoolean', message: 'The argument did not resolve to a boolean.', context });
	}
}
