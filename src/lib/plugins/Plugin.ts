import type { Awaitable } from '@sapphire/utilities';
import type { ClientOptions } from 'discord.js';
import type { SapphireClient } from '../SapphireClient';
import { postInitialization, postLogin, preGenericsInitialization, preInitialization, preLogin } from './symbols';

export abstract class Plugin {
	public static [preGenericsInitialization]?: (this: SapphireClient, options: ClientOptions) => void;

	public static [preInitialization]?: (this: SapphireClient, options: ClientOptions) => void;

	public static [postInitialization]?: (this: SapphireClient, options: ClientOptions) => void;

	public static [preLogin]?: (this: SapphireClient, options: ClientOptions) => Awaitable<void>;

	public static [postLogin]?: (this: SapphireClient, options: ClientOptions) => Awaitable<void>;
}
