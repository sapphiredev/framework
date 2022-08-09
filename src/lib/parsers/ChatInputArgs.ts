import type { CacheType, CommandInteractionOptionResolver } from 'discord.js';

export class ChatInputArgs {
	public readonly options: Omit<CommandInteractionOptionResolver<CacheType>, 'getMessage' | 'getFocused'>;

	public constructor(options: Omit<CommandInteractionOptionResolver<CacheType>, 'getMessage' | 'getFocused'>) {
		this.options = options;
	}
}
