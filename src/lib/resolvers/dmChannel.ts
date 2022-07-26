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
	if (!result.isOk()) return result;
	const value = result.unwrap();
	if (isDMChannel(value) && !value.partial) return Result.ok(value);
	return Result.err(Identifiers.ArgumentDMChannelError);
}
