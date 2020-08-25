import type { ClientOptions } from 'discord.js';
import type { SapphireClient } from '../SapphireClient';
import { PluginHook } from '../types/Enums';
import type { Plugin } from './Plugin';
import { postInitialization, postLogin, preInitialization, preLogin } from './symbols';

export interface SapphirePluginHook {
	(this: SapphireClient, options?: ClientOptions): unknown;
}

export interface SapphirePluginHookEntry {
	hook: SapphirePluginHook;
	type: PluginHook;
	name?: string;
}

export class PluginManager {
	public readonly registeredPlugins = new Set<SapphirePluginHookEntry>();

	public registerPluginHook(hook: SapphirePluginHook, type: PluginHook, name?: string) {
		if (typeof hook !== 'function') throw new TypeError(`The provided hook ${name ? `(${name}) ` : ''}is not a function`);
		this.registeredPlugins.add({ hook, type, name });
		return this;
	}

	public registerPreInitializationPluginHook(hook: SapphirePluginHook, name?: string) {
		return this.registerPluginHook(hook, PluginHook.PreInitialization, name);
	}

	public registerPostInitializationPluginHook(hook: SapphirePluginHook, name?: string) {
		return this.registerPluginHook(hook, PluginHook.PostInitialization, name);
	}

	public registerPreLoginPluginHook(hook: SapphirePluginHook, name?: string) {
		return this.registerPluginHook(hook, PluginHook.PreLogin, name);
	}

	public registerPostLoginPluginHook(hook: SapphirePluginHook, name?: string) {
		return this.registerPluginHook(hook, PluginHook.PostLogin, name);
	}

	public usePlugin(plugin: typeof Plugin) {
		const possibleSymbolHooks: [symbol, PluginHook][] = [
			[preInitialization, PluginHook.PreInitialization],
			[postInitialization, PluginHook.PostInitialization],
			[preLogin, PluginHook.PreLogin],
			[postLogin, PluginHook.PostLogin]
		];
		for (const [hookSymbol, hookType] of possibleSymbolHooks) {
			// @ts-expect-error Element implicitly has an 'any' type because expression of type 'symbol' can't be used to index type 'typeof Plugin'. (7053)
			const hook = plugin[hookSymbol] as SapphirePluginHook;
			if (typeof hook !== 'function') continue;
			this.registerPluginHook(hook, hookType);
		}
		return this;
	}

	public *values(hook?: PluginHook) {
		for (const plugin of this.registeredPlugins) {
			if (hook && plugin.type !== hook) continue;
			yield plugin;
		}
	}
}
