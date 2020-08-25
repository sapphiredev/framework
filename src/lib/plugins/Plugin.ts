import type { ClientOptions } from 'discord.js';
import type { SapphireClient } from '../SapphireClient';
import { postInitialization, postLogin, preInitialization, preLogin } from './symbols';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class Plugin {
	public static [preInitialization]?: (this: SapphireClient, options?: ClientOptions) => void;
	public static [postInitialization]?: (this: SapphireClient, options?: ClientOptions) => void;
	public static [preLogin]?: (this: SapphireClient, options?: ClientOptions) => void;
	public static [postLogin]?: (this: SapphireClient, options?: ClientOptions) => void;
}
