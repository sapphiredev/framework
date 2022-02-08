import { isDMChannel } from '@sapphire/discord.js-utilities';
import { err, ok, Result } from '@sapphire/result';
import type { DMChannel, Message, PartialDMChannel } from 'discord.js';
import { Identifiers } from '../errors/Identifiers';
import { resolveChannel } from './channel';

export function resolvePartialDMChannel(
	parameter: string,
	message: Message
): Result<DMChannel | PartialDMChannel, Identifiers.ArgumentChannelError | Identifiers.ArgumentDMChannelError> {
	const result = resolveChannel(parameter, message);
	if (!result.success) return result;
	if (isDMChannel(result.value)) return ok(result.value);
	return err(Identifiers.ArgumentDMChannelError);
}
