import { ChannelType } from '@klasa/dapi-types';
import { CooldownLevel } from '../types/Enums';

export const commandDefaults = {
	aliases: [],
	bucket: 1,
	cooldown: 0,
	cooldownLevel: CooldownLevel.Author,
	description: '',
	extendedHelp: '',
	enabled: true,
	flags: [],
	guarded: false,
	hidden: false,
	nsfw: false,
	permissionLevel: 0,
	promptLimit: 0,
	promptTime: 30000,
	requiredSettings: [],
	requiredPermissions: 0,
	runIn: [ChannelType.GuildText, ChannelType.DM],
	usage: '',
	usageDelim: '',
	quotedStringSupport: false,
	deletable: false
};
