import type { Guild, Interaction } from 'discord.js';

export default function resolveGuild(guildOrInteraction: Guild | Interaction): Guild | null {
	return isGuild(guildOrInteraction) ? guildOrInteraction : guildOrInteraction.guild;
}

function isGuild(guildOrInteraction: Guild | Interaction): guildOrInteraction is Guild {
	return (guildOrInteraction as Interaction).guild !== undefined;
}
