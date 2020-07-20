import { AliasPiece, AliasPieceOptions, Permissions, PermissionsResolvable, Message } from '@klasa/core';

import type { CommandStore } from './CommandStore';
import type { ChannelType } from '@klasa/dapi-types';

import { RateLimitManager } from '@klasa/ratelimits';

export type CooldownLevel = 'author' | 'channel' | 'guild';

export abstract class Command extends AliasPiece {
	public requiredPermissions: Permissions;
	public deletable: boolean;
	public description: string;
	public extendedHelp: string;
	public fullCategory: string[];
	public guarded: boolean;
	public hidden: boolean;
	public nsfw: boolean;
	public permissionLevel: number;
	public promptLimit: number;
	public promptTime: number;
	public flagSupport: boolean;
	public quotedStringSupport: boolean;
	public runIn: ChannelType[];
	public subcommands: boolean;
	// todo - public usage: CommandUsage;
	public cooldownLevel: CooldownLevel;
	public cooldowns: RateLimitManager;

	public constructor(store: CommandStore, directory: string, files: readonly string[], options: CommandOptions = {}) {
		super(store, directory, files, options);
		options = options as Required<CommandOptions>;

		this.name = this.name.toLowerCase();
		this.requiredPermissions = new Permissions(options.requiredPermissions).freeze();
		this.deletable = options.deletable as boolean;

		this.description = options.description as string;
		this.extendedHelp = options.extendedHelp as string;

		this.fullCategory = files.slice(0, -1);
		this.guarded = options.guarded as boolean;
		this.hidden = options.hidden as boolean;
		this.nsfw = options.nsfw as boolean;
		this.permissionLevel = options.permissionLevel as number;
		this.promptLimit = options.promptLimit as number;
		this.promptTime = options.promptTime as number;
		this.flagSupport = options.flagSupport as boolean;
		this.quotedStringSupport = options.quotedStringSupport as boolean;
		this.runIn = options.runIn as ChannelType[];
		this.subcommands = options.subcommands as boolean;
		// todo - this.usage = new CommandUsage(this.client, options.usage as string, options.usageDelim as string, this);
		this.cooldownLevel = options.cooldownLevel as CooldownLevel;
		if (!['author', 'channel', 'guild'].includes(this.cooldownLevel)) throw new Error('Invalid cooldownLevel');
		this.cooldowns = new RateLimitManager(options.cooldown as number, options.bucket as number);
	}

	public get category(): string {
		return this.fullCategory[0] || 'General';
	}

	public get subCategory(): string {
		return this.fullCategory[1] || 'General';
	}

	public toJSON(): Record<string, any> {
		return {
			...super.toJSON(),
			requiredPermissions: this.requiredPermissions.toArray(),
			category: this.category,
			deletable: this.deletable,
			description: this.description,
			extendedHelp: this.extendedHelp,
			fullCategory: this.fullCategory,
			guarded: this.guarded,
			hidden: this.hidden,
			nsfw: this.nsfw,
			permissionLevel: this.permissionLevel,
			promptLimit: this.promptLimit,
			promptTime: this.promptTime,
			quotedStringSupport: this.quotedStringSupport,
			runIn: this.runIn.slice(0),
			subCategory: this.subCategory,
			subcommands: this.subcommands
			/* todo - usage: {
				usageString: this.usage.usageString,
				usageDelim: this.usage.usageDelim,
				nearlyFullUsage: this.usage.nearlyFullUsage
			} */
		};
	}
}

export interface Command {
	run?(message: Message, params: any[]): Promise<Message[]>;
}

export interface CommandOptions extends AliasPieceOptions {
	bucket?: number;
	cooldown?: number;
	cooldownLevel?: CooldownLevel;
	deletable?: boolean;
	description?: string;
	extendedHelp?: string;
	flagSupport?: boolean;
	guarded?: boolean;
	hidden?: boolean;
	nsfw?: boolean;
	permissionLevel?: number;
	promptLimit?: number;
	promptTime?: number;
	quotedStringSupport?: boolean;
	requiredPermissions?: PermissionsResolvable;
	runIn?: ChannelType[];
	subcommands?: boolean;
	usage?: string;
	usageDelim?: string | undefined;
}
