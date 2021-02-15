import { Piece, PieceContext, PieceOptions } from '@sapphire/pieces';

export abstract class PriorityPiece extends Piece {
	/**
	 * The position at which this piece should be placed at in its store.
	 * @since 1.0.0
	 */
	public readonly position: number;

	public constructor(context: PieceContext, options: PreconditionOptions = {}) {
		super(context, options);
		this.position = options.position ?? 1000;
	}
}

export interface PreconditionOptions extends PieceOptions {
	/**
	 * The position to insert the piece at.
	 * @default 1000
	 */
	position?: number;
}
