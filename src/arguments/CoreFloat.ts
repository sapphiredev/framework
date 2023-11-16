import { container } from '@sapphire/pieces';
import { Identifiers } from '../lib/errors/Identifiers';
import { resolveFloat } from '../lib/resolvers/float';
import { Argument } from '../lib/structures/Argument';

export class CoreArgument extends Argument<number> {
	private readonly messages = {
		[Identifiers.ArgumentFloatTooSmall]: ({ minimum }: Argument.Context) => `The given number must be greater than ${minimum}.`,
		[Identifiers.ArgumentFloatTooLarge]: ({ maximum }: Argument.Context) => `The given number must be less than ${maximum}.`,
		[Identifiers.ArgumentFloatError]: () => 'The argument did not resolve to a valid decimal.'
	} as const;

	public constructor(context: Argument.LoaderContext) {
		super(context, { name: 'float' });
	}

	public run(parameter: string, context: Argument.Context): Argument.Result<number> {
		const resolved = resolveFloat(parameter, { minimum: context.minimum, maximum: context.maximum });
		return resolved.mapErrInto((identifier) =>
			this.error({
				parameter,
				identifier,
				message: this.messages[identifier](context),
				context
			})
		);
	}
}

void container.stores.loadPiece({
	name: 'float',
	piece: CoreArgument,
	store: 'arguments'
});
