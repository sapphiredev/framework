import { container, type PieceContext } from '@sapphire/pieces';
import { resolveEnum } from '../lib/resolvers/enum';
import { Argument } from '../lib/structures/Argument';
import type { EnumArgumentContext } from '../lib/types/ArgumentContexts';

export class CoreArgument extends Argument<string> {
	public constructor(context: PieceContext) {
		super(context, { name: 'enum' });
	}

	public run(parameter: string, context: EnumArgumentContext): Argument.Result<string> {
		const resolved = resolveEnum(parameter, { enum: context.enum, caseInsensitive: context.caseInsensitive });
		return resolved.mapErrInto((identifier) =>
			this.error({
				parameter,
				identifier,
				message: `The argument must have one of the following values: ${context.enum?.join(', ')}`,
				context
			})
		);
	}
}

void container.stores.loadPiece({
	name: 'enum',
	piece: CoreArgument,
	store: 'arguments'
});
