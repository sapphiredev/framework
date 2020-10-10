import type { Piece, Store } from '@sapphire/pieces';
import type { Message } from 'discord.js';
import type { UserError } from '../errors/UserError';
import type { Command } from '../structures/Command';
import type { Event } from '../structures/Event';
import type { PluginHook } from './Enums';

export enum Events {
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
	PieceUnload = 'pieceUnload',
	PiecePostLoad = 'piecePostLoad',
	MentionPrefixOnly = 'mentionPrefixOnly',
	EventError = 'eventError',
	PrefixedMessage = 'prefixedMessage',
	UnknownCommandName = 'unknownCommandName',
	UnknownCommand = 'unknownCommand',
	PreCommandRun = 'preCommandRun',
	CommandDenied = 'commandDenied',
	CommandAccepted = 'commandAccepted',
	CommandRun = 'commandRun',
	CommandSuccess = 'commandSuccess',
	CommandFinish = 'commandFinish',
	CommandError = 'commandError',
	PluginLoaded = 'pluginLoaded'
	// #endregion Sapphire load cycle events
}

export interface IPieceError {
	piece: Piece;
}

export interface EventErrorPayload extends IPieceError {
	piece: Event;
}

export interface CommandErrorPayload extends IPieceError {
	piece: Command;
	message: Message;
}

export interface ICommandPayload {
	message: Message;
	command: Command;
}

export interface CommandDeniedPayload extends ICommandPayload {
	parameters: string;
	commandName: string;
	prefix: string;
}

export interface CommandAcceptedPayload extends ICommandPayload {
	parameters: string;
}

export interface CommandSuccessPayload extends ICommandPayload {
	result: unknown;
	parameters: string;
}

export interface PreCommandRunPayload extends CommandDeniedPayload {}

declare module 'discord.js' {
	interface ClientEvents {
		// #region Sapphire load cycle events
		[Events.PieceUnload]: [Store<Piece>, Piece];
		[Events.PiecePostLoad]: [Store<Piece>, Piece];
		[Events.MentionPrefixOnly]: [Message];
		[Events.EventError]: [Error, EventErrorPayload];
		[Events.PrefixedMessage]: [Message, string];
		[Events.UnknownCommandName]: [Message, string];
		[Events.UnknownCommand]: [Message, string, string];
		[Events.PreCommandRun]: [PreCommandRunPayload];
		[Events.CommandDenied]: [UserError, CommandDeniedPayload];
		[Events.CommandAccepted]: [CommandAcceptedPayload];
		[Events.CommandRun]: [Message, Command];
		[Events.CommandSuccess]: [CommandSuccessPayload];
		[Events.CommandError]: [Error, CommandErrorPayload];
		[Events.CommandFinish]: [Message, Command];
		[Events.PluginLoaded]: [PluginHook, string | undefined];
		// #endregion Sapphire load cycle events

		// #region Termination
		[K: string]: unknown[];
		// #endregion Termination
	}
}
