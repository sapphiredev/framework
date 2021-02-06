import type { DMChannel, NewsChannel, TextChannel } from 'discord.js';
import type { ArgumentContext } from '../structures/Argument';

export interface BoundedArgumentContext extends ArgumentContext {
	minimum?: number;
	maximum?: number;
}

export interface MessageArgumentContext extends ArgumentContext {
	/**
	 * The channel from which the message ID should be fetched from. If a direct
	 * message link is provided, this option will be ignored, as direct message
	 * links to messages sent in guilds already specify a channel ID.
	 */
	channel?: DMChannel | NewsChannel | TextChannel;
}
