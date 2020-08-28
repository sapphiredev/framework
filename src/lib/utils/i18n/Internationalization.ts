import type { Message } from 'discord.js';
import type { Awaited } from '../Types';
import type { IInternationalization } from './IInternationalization';

export class Internationalization implements IInternationalization {
	public defaultName: string;
	public constructor(defaultName: string) {
		this.defaultName = defaultName;
	}

	public resolveNameFromMessage(message: Message): Awaited<string> {
		return message.guild?.preferredLocale ?? this.defaultName;
	}

	public resolveValue(): Awaited<string> {
		throw new TypeError('The base Internationalization may not be used. Please refer to using a plugin or use your own implementation.');
	}
}
