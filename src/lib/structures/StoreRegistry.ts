import Collection from '@discordjs/collection';
import { getRootData, Piece, Store } from '@sapphire/pieces';
import { join } from 'path';
import type { ArgumentStore } from './ArgumentStore';
import type { CommandStore } from './CommandStore';
import type { EventStore } from './EventStore';
import type { PreconditionStore } from './PreconditionStore';

type Key = keyof StoreRegistryEntries;
type Value = StoreRegistryEntries[Key];

/**
 * A strict-typed store registry. This is available in both {@link Client.stores} and {@link Store.injectedContext}.
 * @since 1.0.0
 * @example
 * ```typescript
 * // Adding new stores
 *
 * // Register the store:
 * Store.injectedContext.stores.register(new RouteStore());
 *
 * // Augment Sapphire to add the new store, in case of a JavaScript
 * // project, this can be moved to an `Augments.d.ts` (or any other name)
 * // file somewhere:
 * declare module '@sapphire/framework' {
 *   export interface StoreRegistryEntries {
 *     routes: RouteStore;
 *   }
 * }
 * ```
 */
export class StoreRegistry extends Collection<Key, Value> {
	/**
	 * Registers all user directories from the process working directory, the default value is obtained by assuming
	 * CommonJS (high accuracy) but with fallback for ECMAScript Modules (reads package.json's `main` entry, fallbacks
	 * to `process.cwd()`).
	 *
	 * By default, if you have this folder structure:
	 * ```
	 * /home/me/my-bot
	 * ├─ src
	 * │  ├─ commands
	 * │  ├─ events
	 * │  └─ main.js
	 * └─ package.json
	 * ```
	 *
	 * And you run `node src/main.js`, the directories `/home/me/my-bot/src/commands` and `/home/me/my-bot/src/events` will
	 * be registered for the commands and events stores respectively, since both directories are located in the same
	 * directory as your main file.
	 *
	 * **Note**: this also registers directories for all other stores, even if they don't have a folder, this allows you
	 * to create new pieces and hot-load them later anytime.
	 * @since 1.0.0
	 * @param rootDirectory The root directory to register pieces at.
	 */
	public registerUserDirectories(rootDirectory = getRootData().root) {
		for (const store of this.values()) {
			store.registerPath(join(rootDirectory, store.name));
		}
	}

	/**
	 * Registers a store.
	 * @since 1.0.0
	 * @param store The store to register.
	 */
	public register<T extends Piece>(store: Store<T>): this {
		this.set(store.name as Key, store as unknown as Value);
		return this;
	}

	/**
	 * Deregisters a store.
	 * @since 1.0.0
	 * @param store The store to deregister.
	 */
	public deregister<T extends Piece>(store: Store<T>): this {
		this.delete(store.name as Key);
		return this;
	}
}

export interface StoreRegistry {
	get<K extends Key>(key: K): StoreRegistryEntries[K];
	get(key: string): undefined;
	has(key: Key): true;
	has(key: string): false;
}

/**
 * The {@link StoreRegistry}'s registry, use module augmentation against this interface when adding new stores.
 * @since 1.0.0
 */
export interface StoreRegistryEntries {
	arguments: ArgumentStore;
	commands: CommandStore;
	events: EventStore;
	preconditions: PreconditionStore;
}
