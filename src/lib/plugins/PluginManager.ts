import type { ClientOptions } from 'discord.js';
import type { SapphireClient } from '../SapphireClient';
import { PluginHook } from '../types/Enums';
import type { Plugin } from './Plugin';
import { postInitialization, postLogin, preGenericsInitialization, preInitialization, preLogin } from './symbols';

export interface SapphirePluginHook {
	(this: SapphireClient, options: ClientOptions): unknown;
}
export interface SapphirePluginAsyncHook {
	(this: SapphireClient, options: ClientOptions): Promise<unknown>;
}

export interface SapphirePluginHookEntry {
	hook: SapphirePluginHook | SapphirePluginAsyncHook;
	type: PluginHook;
	name?: string;
}

export class PluginManager {
	public readonly registry = new Set<SapphirePluginHookEntry>();

	public registerHook(hook: SapphirePluginHook | SapphirePluginAsyncHook, type: PluginHook, name?: string) {
		if (typeof hook !== 'function') throw new TypeError(`The provided hook ${name ? `(${name}) ` : ''}is not a function`);
		this.registry.add({ hook, type, name });
		return this;
	}

	public registerPreGenericsInitializationHook(hook: SapphirePluginHook, name?: string) {
		return this.registerHook(hook, PluginHook.PreGenericsInitialization, name);
	}

	public registerPreInitializationHook(hook: SapphirePluginHook, name?: string) {
		return this.registerHook(hook, PluginHook.PreInitialization, name);
	}

	public registerPostInitializationHook(hook: SapphirePluginHook, name?: string) {
		return this.registerHook(hook, PluginHook.PostInitialization, name);
	}

	public registerPreLoginHook(hook: SapphirePluginAsyncHook, name?: string) {
		return this.registerHook(hook, PluginHook.PreLogin, name);
	}

	public registerPostLoginHook(hook: SapphirePluginAsyncHook, name?: string) {
		return this.registerHook(hook, PluginHook.PostLogin, name);
	}

	public use(plugin: typeof Plugin) {
		const possibleSymbolHooks: [symbol, PluginHook][] = [
			[preGenericsInitialization, PluginHook.PreGenericsInitialization],
			[preInitialization, PluginHook.PreInitialization],
			[postInitialization, PluginHook.PostInitialization],
			[preLogin, PluginHook.PreLogin],
			[postLogin, PluginHook.PostLogin]
		];
		for (const [hookSymbol, hookType] of possibleSymbolHooks) {
			const hook = Reflect.get(plugin, hookSymbol) as SapphirePluginHook;
			if (typeof hook !== 'function') continue;
			this.registerHook(hook, hookType);
		}
		return this;
	}

	public *values(hook?: PluginHook) {
		for (const plugin of this.registry) {
			if (hook && plugin.type !== hook) continue;
			yield plugin;
		}
	}
}
