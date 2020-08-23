import type { Awaited } from '@sapphire/pieces';
import type { Message } from 'discord.js';
import type { Command } from '../../structures/Command';

export interface IPreconditionContainer {
	run(message: Message, command: Command): Awaited<boolean>;
}
