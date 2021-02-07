import type { Piece, Store } from '@sapphire/pieces';
import type { Message } from 'discord.js';
import type { UserError } from '../errors/UserError';
import type { Command, CommandContext } from '../structures/Command';
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
	ShardReady = 'shardReady',
	ShardReconnecting = 'shardReconnecting',
	ShardResume = 'shardResume',
	// #endregion Discord.js base events

	// #region Sapphire load cycle events
	PieceUnload = 'pieceUnload',
	PiecePostLoad = 'piecePostLoad',
	MentionPrefixOnly = 'mentionPrefixOnly',
	EventError = 'eventError',
	PreMessageParsed = 'preMessageParsed',
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

export interface CommandErrorPayload extends CommandAcceptedPayload {
	piece: Command;
}

export interface UnknownCommandNamePayload {
	message: Message;
	prefix: string | RegExp;
	commandPrefix: string;
}

export interface UnknownCommandPayload extends UnknownCommandNamePayload {}

export interface ICommandPayload {
	message: Message;
	command: Command;
}

export interface CommandDeniedPayload extends ICommandPayload {
	parameters: string;
	context: CommandContext;
}

export interface CommandAcceptedPayload extends ICommandPayload {
	parameters: string;
	context: CommandContext;
}

export interface CommandSuccessPayload extends CommandAcceptedPayload {
	result: unknown;
}

export interface PreCommandRunPayload extends CommandDeniedPayload {}

declare module 'discord.js' {
	interface ClientEvents {
		// #region Sapphire load cycle events
		[Events.PieceUnload]: [store: Store<Piece>, piece: Piece];
		[Events.PiecePostLoad]: [store: Store<Piece>, piece: Piece];
		[Events.MentionPrefixOnly]: [message: Message];
		[Events.EventError]: [error: Error, payload: EventErrorPayload];
		[Events.PreMessageParsed]: [message: Message];
		[Events.PrefixedMessage]: [message: Message, prefix: string | RegExp];
		[Events.UnknownCommandName]: [payload: UnknownCommandNamePayload];
		[Events.UnknownCommand]: [payload: UnknownCommandPayload];
		[Events.PreCommandRun]: [payload: PreCommandRunPayload];
		[Events.CommandDenied]: [error: UserError, payload: CommandDeniedPayload];
		[Events.CommandAccepted]: [payload: CommandAcceptedPayload];
		[Events.CommandRun]: [message: Message, command: Command, payload: CommandAcceptedPayload];
		[Events.CommandSuccess]: [payload: CommandSuccessPayload];
		[Events.CommandError]: [error: Error, payload: CommandErrorPayload];
		[Events.CommandFinish]: [message: Message, command: Command, payload: CommandAcceptedPayload];
		[Events.PluginLoaded]: [hook: PluginHook, name: string | undefined];
		// #endregion Sapphire load cycle events

		// #region Termination
		[K: string]: unknown[];
		// #endregion Termination
	}
}
