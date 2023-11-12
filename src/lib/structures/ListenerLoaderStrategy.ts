import { LoaderStrategy } from '@sapphire/pieces';
import type { Listener } from './Listener';
import type { ListenerStore } from './ListenerStore';

export class ListenerLoaderStrategy extends LoaderStrategy<Listener> {
	// @ts-expect-error pieces/#345 - LoaderStrategy needs to be patched to support arguments.
	public override onLoad(_store: ListenerStore, piece: Listener) {
		const listenerCallback = piece['_listener'];
		if (listenerCallback) {
			const emitter = piece.emitter!;

			// Increment the maximum amount of listeners by one:
			const maxListeners = emitter.getMaxListeners();
			if (maxListeners !== 0) emitter.setMaxListeners(maxListeners + 1);

			emitter[piece.once ? 'once' : 'on'](piece.event, listenerCallback);
		}
	}

	// @ts-expect-error pieces/#345 - LoaderStrategy needs to be patched to support arguments.
	public override onUnload(_store: ListenerStore, piece: Listener) {
		const listenerCallback = piece['_listener'];
		if (!piece.once && listenerCallback) {
			const emitter = piece.emitter!;

			// Increment the maximum amount of listeners by one:
			const maxListeners = emitter.getMaxListeners();
			if (maxListeners !== 0) emitter.setMaxListeners(maxListeners - 1);

			emitter.off(piece.event, listenerCallback);
			piece['_listener'] = null;
		}
	}
}
