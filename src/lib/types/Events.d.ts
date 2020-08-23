import type { Piece, Store } from '@sapphire/pieces';
import {
	Channel,
	Collection,
	CloseEvent,
	Guild,
	GuildEmoji,
	GuildMember,
	Invite,
	Message as DjSMessage,
	MessageReaction,
	PartialDMChannel,
	PartialGuildMember,
	PartialMessage,
	PartialUser,
	Presence,
	RateLimitData,
	Role,
	Snowflake,
	Speaking,
	TextChannel,
	User,
	VoiceState
} from 'discord.js';

export const enum Events {
	// #region Discord.js base events
	ChannelCreate = 'channelCreate',
	ChannelDelete = 'channelDelete',
	ChannelPinsUpdate = 'channelPinsUpdate',
	ChannelUpdate = 'channelUpdate',
	Debug = 'debug',
	Warn = 'warn',
	Disconnect = 'disconnect',
	EmojiCreate = 'emojiCreate',
	EmojiDelete = 'emojiDelete',
	EmojiUpdate = 'emojiUpdate',
	Error = 'error',
	GuildBanAdd = 'guildBanAdd',
	GuildBanRemove = 'guildBanRemove',
	GuildCreate = 'guildCreate',
	GuildDelete = 'guildDelete',
	GuildUnavailable = 'guildUnavailable',
	GuildIntegrationsUpdate = 'guildIntegrationsUpdate',
	GuildMemberAdd = 'guildMemberAdd',
	GuildMemberAvailable = 'guildMemberAvailable',
	GuildMemberRemove = 'guildMemberRemove',
	GuildMembersChunk = 'guildMembersChunk',
	GuildMemberSpeaking = 'guildMemberSpeaking',
	GuildMemberUpdate = 'guildMemberUpdate',
	GuildUpdate = 'guildUpdate',
	InviteCreate = 'inviteCreate',
	InviteDelete = 'inviteDelete',
	Message = 'message',
	MessageDelete = 'messageDelete',
	MessageReactionRemoveAll = 'messageReactionRemoveAll',
	MessageReactionRemoveEmoji = 'messageReactionRemoveEmoji',
	MessageDeleteBulk = 'messageDeleteBulk',
	MessageReactionAdd = 'messageReactionAdd',
	MessageReactionRemove = 'messageReactionRemove',
	MessageUpdate = 'messageUpdate',
	PresenceUpdate = 'presenceUpdate',
	RateLimit = 'rateLimit',
	Ready = 'ready',
	Invalidated = 'invalidated',
	RoleCreate = 'roleCreate',
	RoleDelete = 'roleDelete',
	RoleUpdate = 'roleUpdate',
	TypingsStart = 'typingStart',
	UserUpdate = 'userUpdate',
	VoiceStateUpdate = 'voiceStateUpdate',
	WebhookUpdate = 'webhookUpdate',
	ShardDisconnect = 'shardDisconnect',
	ShardError = 'shardError',
	SharedReady = 'shardReady',
	ShardReconnecting = 'shardReconnecting',
	ShardResume = 'shardResume',
	// #endregion Discord.js base events

	// #region Sapphire load cycle events
	Unload = 'unload',
	PostLoad = 'postLoad'
	// #endregion Sapphire load cycle events
}

export interface EventParameters {
	// #region Discord.js base events
	[Events.ChannelCreate]: [Channel];
	[Events.ChannelDelete]: [Channel | PartialDMChannel];
	[Events.ChannelPinsUpdate]: [Channel | PartialDMChannel, Date];
	[Events.ChannelUpdate]: [Channel, Channel];
	[Events.Debug]: [string];
	[Events.Warn]: [string];
	[Events.Disconnect]: [unknown, number];
	[Events.EmojiCreate]: [GuildEmoji];
	[Events.EmojiDelete]: [GuildEmoji];
	[Events.EmojiUpdate]: [GuildEmoji, GuildEmoji];
	[Events.Error]: [Error | string];
	[Events.GuildBanAdd]: [Guild, User | PartialUser];
	[Events.GuildBanRemove]: [Guild, User | PartialUser];
	[Events.GuildCreate]: [Guild];
	[Events.GuildDelete]: [Guild];
	[Events.GuildUnavailable]: [Guild];
	[Events.GuildIntegrationsUpdate]: [Guild];
	[Events.GuildMemberAdd]: [GuildMember | PartialGuildMember];
	[Events.GuildMemberAvailable]: [GuildMember | PartialGuildMember];
	[Events.GuildMemberRemove]: [GuildMember | PartialGuildMember];
	[Events.GuildMembersChunk]: [Collection<Snowflake, GuildMember | PartialGuildMember>, Guild];
	[Events.GuildMemberSpeaking]: [GuildMember | PartialGuildMember, Readonly<Speaking>];
	[Events.GuildMemberUpdate]: [GuildMember | PartialGuildMember, GuildMember | PartialGuildMember];
	[Events.GuildUpdate]: [Guild, Guild];
	[Events.InviteCreate]: [Invite];
	[Events.InviteDelete]: [Invite];
	[Events.Message]: [DjSMessage];
	[Events.MessageDelete]: [DjSMessage | PartialMessage];
	[Events.MessageReactionRemoveAll]: [DjSMessage | PartialMessage];
	[Events.MessageReactionRemoveEmoji]: [MessageReaction];
	[Events.MessageDeleteBulk]: [Collection<Snowflake, DjSMessage | PartialMessage>];
	[Events.MessageReactionAdd]: [MessageReaction, User | PartialUser];
	[Events.MessageReactionRemove]: [MessageReaction, User | PartialUser];
	[Events.MessageUpdate]: [DjSMessage | PartialMessage, DjSMessage | PartialMessage];
	[Events.PresenceUpdate]: [Presence | undefined, Presence];
	[Events.RateLimit]: [RateLimitData];
	[Events.Ready]: [];
	[Events.Invalidated]: [];
	[Events.RoleCreate]: [Role];
	[Events.RoleDelete]: [Role];
	[Events.RoleUpdate]: [Role, Role];
	[Events.TypingsStart]: [Channel | PartialDMChannel, User | PartialUser];
	[Events.UserUpdate]: [User | PartialUser, User | PartialUser];
	[Events.VoiceStateUpdate]: [VoiceState, VoiceState];
	[Events.WebhookUpdate]: [TextChannel];
	[Events.ShardDisconnect]: [CloseEvent, number];
	[Events.ShardError]: [Error, number];
	[Events.SharedReady]: [number];
	[Events.ShardReconnecting]: [number];
	[Events.ShardResume]: [number, number];
	// #endregion Discord.js base events

	// #region Sapphire load cycle events
	[Events.Unload]: [Store<Piece>, Piece];
	[Events.PostLoad]: [Store<Piece>, Piece];
	// #endregion Sapphire load cycle events
}
