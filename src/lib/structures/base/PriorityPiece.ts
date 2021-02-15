import { Piece, PieceContext, PieceOptions } from '@sapphire/pieces';

export abstract class PriorityPiece extends Piece {
	public readonly position: number;

	public constructor(context: PieceContext, options: PreconditionOptions = {}) {
		super(context, options);
		this.position = options.position ?? 1000;
	}
}

export interface PreconditionOptions extends PieceOptions {
	/**
	 * The position to insert the middleware at.
	 * @default 1000
	 */
	position?: number;
}
