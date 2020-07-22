// Copyright (c) 2017-2019 dirigeants. All rights reserved. MIT license.

import { AliasPiece, AliasPieceOptions, Permissions, PermissionsResolvable } from '@klasa/core';

import type { CommandStore } from './CommandStore';
import type { ChannelType } from '@klasa/dapi-types';

import { RateLimitManager } from '@klasa/ratelimits';
import { CooldownLevel } from '../types/Enums';

export abstract class Command extends AliasPiece {
	/**
	 * Permissions required by the bot to run the command
	 * @since 0.0.1
	 */
	public requiredPermissions: Permissions;

	/**
	 * Delete command's response if the trigger message was deleted
	 * @since 0.0.1
	 */
	public deletable: boolean;

	/**
	 * A basic summary about the command
	 * @since 0.0.1
	 */
	public description: string;

	/**
	 * Longer version of command's summary and how to use it
	 * @since 0.0.1
	 */
	public extendedHelp: string;

	/**
	 * Full category name of the command
	 * @since 0.0.1
	 */
	public fullCategory: string[];

	/**
	 * Allow disabling of the command in a guild or not
	 * @since 0.0.1
	 */
	public guarded: boolean;

	/**
	 * Whehter to show the command in the help message or not
	 * @since 0.0.1
	 */
	public hidden: boolean;

	/**
	 * If the command will only work in NSFW channels
	 * @since 0.0.1
	 */
	public nsfw: boolean;

	/**
	 * Required level of permission to use the command
	 * @since 0.0.1
	 */
	public permissionLevel: number;

	/**
	 * Number of re-prompts of an argument
	 * @since 0.0.1
	 */
	public promptLimit: number;

	/**
	 * Time allowed for re-prompts
	 * @since 0.0.1
	 */
	public promptTime: number;

	/**
	 * Accepted flags for the command
	 * @since 0.0.1
	 */
	public flags: string[];

	/**
	 * Allow use of quoted strings for arguments
	 * @since 0.0.1
	 */
	public quotedStringSupport: boolean;

	/**
	 * Which type of channel the command can execute in
	 * @since 0.0.1
	 */
	public runIn: ChannelType[];

	// todo - public usage: CommandUsage;

	/**
	 * Whether the cooldown applies to author, channel or guild
	 * @since 0.0.1
	 */
	public cooldownLevel: CooldownLevel;

	/**
	 * The time and limit for cooldown
	 * @since 0.0.1
	 */
	public cooldowns: RateLimitManager;

	/**
	 * @since 0.0.1
	 * @param store The command store
	 * @param directory The base directory to the pieces folder
	 * @param file The path from the pieces folder to the command file
	 * @param options Optional Command settings
	 */
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
		this.flags = options.flags as string[];
		this.quotedStringSupport = options.quotedStringSupport as boolean;
		this.runIn = options.runIn as ChannelType[];
		// todo - this.usage = new CommandUsage(this.client, options.usage as string, options.usageDelim as string, this);
		this.cooldownLevel = options.cooldownLevel as CooldownLevel;
		if (![CooldownLevel.Author, CooldownLevel.Channel, CooldownLevel.Guild].includes(this.cooldownLevel))
			throw new Error('Invalid cooldownLevel');
		this.cooldowns = new RateLimitManager(options.cooldown as number, options.bucket as number);
	}

	/**
	 * The main category for the command
	 * @since 0.0.1
	 * @readonly
	 */
	public get category(): string {
		return this.fullCategory.length > 0 ? this.fullCategory[0] : 'General';
	}

	/**
	 * The sub category for the command
	 * @since 0.0.1
	 * @readonly
	 */
	public get subCategory(): string {
		return this.fullCategory.length > 1 ? this.fullCategory[1] : 'General';
	}

	/**
	 * Defines the JSON.stringify behavior of the command
	 * @returns {Object}
	 */
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
			subCategory: this.subCategory
			/* todo - usage: {
				usageString: this.usage.usageString,
				usageDelim: this.usage.usageDelim,
				nearlyFullUsage: this.usage.nearlyFullUsage
			} */
		};
	}
}

export interface CommandOptions extends AliasPieceOptions {
	bucket?: number;
	cooldown?: number;
	cooldownLevel?: CooldownLevel;
	deletable?: boolean;
	description?: string;
	extendedHelp?: string;
	flags?: string[];
	guarded?: boolean;
	hidden?: boolean;
	nsfw?: boolean;
	permissionLevel?: number;
	promptLimit?: number;
	promptTime?: number;
	quotedStringSupport?: boolean;
	requiredPermissions?: PermissionsResolvable;
	runIn?: ChannelType[];
	usage?: string;
	usageDelim?: string | undefined;
}
