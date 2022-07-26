export enum CooldownLevel {
	Author = 'author',
	Channel = 'channel',
	Guild = 'guild'
}

export enum PluginHook {
	PreGenericsInitialization = 'preGenericsInitialization',
	PreInitialization = 'preInitialization',
	PostInitialization = 'postInitialization',
	PreLogin = 'preLogin',
	PostLogin = 'postLogin'
}

/**
 * The scope the cooldown applies to.
 */
export enum BucketScope {
	/**
	 * Per channel cooldowns.
	 */
	Channel,
	/**
	 * Global cooldowns.
	 */
	Global,
	/**
	 * Per guild cooldowns.
	 */
	Guild,
	/**
	 * Per user cooldowns.
	 */
	User
}

export enum RegisterBehavior {
	Overwrite = 'OVERWRITE',
	LogToConsole = 'LOG_TO_CONSOLE',
	/**
	 * Finds all differences in the commands provided using our internal computation method, and logs them to the console, while applying them.
	 *
	 * @danger This can potentially cause slowdowns when booting up your bot as computing differences on big commands can take a while.
	 * We recommend you use `OVERWRITE` instead in production.
	 * @deprecated This mode should be considered "deprecated" in the sense it won't get the same attention as the other modes. It's still usable, but it might
	 * also remain behind compared to API updates.
	 */
	VerboseOverwrite = 'VERBOSE_OVERWRITE'
}

export const enum InternalRegistryAPIType {
	ChatInput,
	ContextMenu
}
