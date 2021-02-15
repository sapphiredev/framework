import { Store } from '@sapphire/pieces';
import type { PriorityPiece } from './PriorityPiece';

/**
 * @since 1.0.0
 */
export abstract class PriorityPieceStore<T extends PriorityPiece> extends Store<T> {
	/**
	 * The sorted middlewares, in ascending order of {@see T#position}.
	 */
	public readonly sortedPieces: T[] = [];

	public set(key: string, value: T): this {
		const index = this.sortedPieces.findIndex((middleware) => middleware.position >= value.position);

		// If a middleware with lower priority wasn't found, push to the end of the array
		if (index === -1) this.sortedPieces.push(value);
		else this.sortedPieces.splice(index, 0, value);

		return super.set(key, value);
	}

	public delete(key: string): boolean {
		const index = this.sortedPieces.findIndex((middleware) => middleware.name === key);

		// If the middleware was found, remove it
		if (index !== -1) this.sortedPieces.splice(index, 1);

		return super.delete(key);
	}

	public clear(): void {
		this.sortedPieces.length = 0;
		return super.clear();
	}
}
