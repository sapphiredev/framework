import type { Awaited } from '@sapphire/pieces';
import { Message, MessageAdditions, MessageOptions, SplitOptions, Structures } from 'discord.js';

export class SapphireMessage extends Structures.get('Message') {
	public fetchLanguage(): Awaited<string> {
		return this.client.i18n.resolveNameFromMessage(this);
	}

	public async fetchLanguageKey(key: string, ...values: readonly unknown[]): Promise<string> {
		return this.client.i18n.resolveValue(await this.fetchLanguage(), key, ...values);
	}

	public sendTranslated(
		key: string,
		values?: readonly unknown[],
		options?: MessageOptions | (MessageOptions & { split?: false }) | MessageAdditions
	): Promise<Message>;

	public sendTranslated(key: string, values?: readonly unknown[], options?: MessageOptions & { split: true | SplitOptions }): Promise<Message[]>;
	public sendTranslated(key: string, options?: MessageOptions | (MessageOptions & { split?: false }) | MessageAdditions): Promise<Message>;
	public sendTranslated(key: string, options?: MessageOptions & { split: true | SplitOptions }): Promise<Message[]>;
	public async sendTranslated(
		key: string,
		valuesOrOptions?: readonly unknown[] | MessageOptions | MessageAdditions,
		rawOptions?: MessageOptions
	): Promise<Message | Message[]> {
		const [values, options]: [unknown[], MessageOptions] =
			typeof valuesOrOptions === 'undefined' || Array.isArray(valuesOrOptions)
				? [valuesOrOptions ?? [], rawOptions ?? {}]
				: [[], valuesOrOptions as MessageOptions];
		const content = await this.fetchLanguageKey(key, ...values);
		return this.channel.send(content, options);
	}
}

Structures.extend('Message', () => SapphireMessage);
