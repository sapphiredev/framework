import { isThreadChannel } from '@sapphire/discord.js-utilities';
import type { Guild, ThreadChannel } from 'discord.js';
import { Identifiers } from '../errors/Identifiers';
import type { Result } from '../parsers/Result';
import { resolveGuildChannelPredicate } from '../utils/resolvers/resolveGuildChannelPredicate';

export function resolveGuildThreadChannel(
	parameter: string,
	guild: Guild
): Result<ThreadChannel, Identifiers.ArgumentGuildChannelError | Identifiers.ArgumentGuildThreadChannelError> {
	return resolveGuildChannelPredicate(parameter, guild, isThreadChannel, Identifiers.ArgumentGuildThreadChannelError);
}
