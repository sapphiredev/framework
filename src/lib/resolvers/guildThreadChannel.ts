import { isThreadChannel } from '@sapphire/discord.js-utilities';
import type { Result } from '@sapphire/result';
import type { Guild, ThreadChannel } from 'discord.js';
import { Identifiers } from '../errors/Identifiers';
import { resolveGuildChannelPredicate } from '../utils/resolvers/resolveGuildChannelPredicate';

export function resolveGuildThreadChannel(
	parameter: string,
	guild: Guild
): Result<ThreadChannel, Identifiers.ArgumentGuildChannelError | Identifiers.ArgumentGuildThreadChannelError> {
	return resolveGuildChannelPredicate(parameter, guild, isThreadChannel, Identifiers.ArgumentGuildThreadChannelError);
}
