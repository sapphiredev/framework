import type { PluginHook } from '../types/Enums';
import type { ClientOptions } from 'discord.js';
import type { SapphireClient } from '../SapphireClient';

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

	public *plugins(hook?: PluginHook) {
		for (const plugin of this.registeredPlugins) {
			if (hook && plugin.type !== hook) continue;
			yield plugin;
		}
	}
}
