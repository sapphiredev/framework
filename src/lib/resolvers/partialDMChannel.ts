import { isDMChannel } from '@sapphire/discord.js-utilities';
import type { DMChannel, Message, PartialDMChannel } from 'discord.js';
import { Identifiers } from '../errors/Identifiers';
import { err, ok, Result } from '../parsers/Result';
import { resolveChannel } from './channel';

export function resolvePartialDMChannel(
	parameter: string,
	message: Message
): Result<PartialDMChannel, Identifiers.ArgumentChannelError | Identifiers.ArgumentDMChannelError> {
	const result = resolveChannel(parameter, message);
	if (!result.success) return result;
	if (isDMChannel(result.value) && result.value.partial) return ok(result.value);
	return err(Identifiers.ArgumentDMChannelError);
}
