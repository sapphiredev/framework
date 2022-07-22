import { isDMChannel } from '@sapphire/discord.js-utilities';
import { Result } from '@sapphire/result';
import type { DMChannel, Message } from 'discord.js';
import { Identifiers } from '../errors/Identifiers';
import { resolveChannel } from './channel';

export function resolveDMChannel(
	parameter: string,
	message: Message
): Result<DMChannel, Identifiers.ArgumentChannelError | Identifiers.ArgumentDMChannelError> {
	const result = resolveChannel(parameter, message);
	if (!result.success) return result;
	if (isDMChannel(result.value) && !result.value.partial) return Result.ok(result.value);
	return Result.err(Identifiers.ArgumentDMChannelError);
}
