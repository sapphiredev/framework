import { isVoiceChannel } from '@sapphire/discord.js-utilities';
import type { Guild, VoiceChannel } from 'discord.js';
import { Identifiers } from '../errors/Identifiers';
import type { Result } from '../parsers/Result';
import { resolveGuildChannelPredicate } from '../utils/resolvers/resolveGuildChannelPredicate';

export function resolveGuildVoiceChannel(
	parameter: string,
	guild: Guild
): Result<VoiceChannel, Identifiers.ArgumentGuildChannelError | Identifiers.ArgumentGuildVoiceChannelError> {
	return resolveGuildChannelPredicate(parameter, guild, isVoiceChannel, Identifiers.ArgumentGuildVoiceChannelError);
}
