import { ChannelType, type APIApplicationCommandChannelOption } from 'discord-api-types/v10';
import type { CommandDifference } from '../_shared';

const channelTypeToPrettyName: Record<Exclude<APIApplicationCommandChannelOption['channel_types'], undefined>[number], string> = {
	[ChannelType.GuildText]: 'text channel (type 0)',
	[ChannelType.GuildVoice]: 'voice channel (type 2)',
	[ChannelType.GuildCategory]: 'guild category (type 4)',
	[ChannelType.GuildAnnouncement]: 'guild announcement channel (type 5)',
	[ChannelType.AnnouncementThread]: 'guild announcement thread (type 10)',
	[ChannelType.PublicThread]: 'guild public thread (type 11)',
	[ChannelType.PrivateThread]: 'guild private thread (type 12)',
	[ChannelType.GuildStageVoice]: 'guild stage voice channel (type 13)',
	[ChannelType.GuildForum]: 'guild forum (type 15)',
	[ChannelType.GuildMedia]: 'guild media channel (type 16)'
};

const unknownChannelType = (type: number): string => `unknown channel type (${type}); please contact Sapphire developers about this!`;

function getChannelTypePrettyName(type: keyof typeof channelTypeToPrettyName): string {
	return channelTypeToPrettyName[type] ?? unknownChannelType(type);
}

export function* checkChannelTypes({
	existingChannelTypes,
	newChannelTypes,
	currentIndex,
	keyPath
}: {
	currentIndex: number;
	keyPath: (index: number) => string;
	existingChannelTypes?: APIApplicationCommandChannelOption['channel_types'];
	newChannelTypes?: APIApplicationCommandChannelOption['channel_types'];
}): Generator<CommandDifference> {
	// 0. No existing channel types and now we have channel types
	if (!existingChannelTypes?.length && newChannelTypes?.length) {
		yield {
			key: `${keyPath(currentIndex)}.channel_types`,
			original: 'no channel types present',
			expected: 'channel types present'
		};
	}
	// 1. Existing channel types and now we have no channel types
	else if (existingChannelTypes?.length && !newChannelTypes?.length) {
		yield {
			key: `${keyPath(currentIndex)}.channel_types`,
			original: 'channel types present',
			expected: 'no channel types present'
		};
	}
	// 2. Iterate over each channel type if we have any and see what's different
	else if (newChannelTypes?.length) {
		let index = 0;
		for (const channelType of newChannelTypes) {
			const currentIndex = index++;
			const existingChannelType = existingChannelTypes![currentIndex];
			if (channelType !== existingChannelType) {
				yield {
					key: `${keyPath(currentIndex)}.channel_types[${currentIndex}]`,
					original: existingChannelType === undefined ? 'no channel type present' : getChannelTypePrettyName(existingChannelType),
					expected: getChannelTypePrettyName(channelType)
				};
			}
		}

		// If we went through less channel types than we previously had, report that
		if (index < existingChannelTypes!.length) {
			let channelType: Exclude<APIApplicationCommandChannelOption['channel_types'], undefined>[number];
			while ((channelType = existingChannelTypes![index]) !== undefined) {
				yield {
					key: `${keyPath(index)}.channel_types[${index}]`,
					expected: 'no channel type present',
					original: getChannelTypePrettyName(channelType)
				};

				index++;
			}
		}
	}
}
