export const enum CooldownLevel {
	Author = 'author',
	Channel = 'channel',
	Guild = 'guild'
}

export const enum PluginHook {
	PreGenericsInitialization = 'preGenericsInitialization',
	PreInitialization = 'preInitialization',
	PostInitialization = 'postInitialization',
	PreLogin = 'preLogin',
	PostLogin = 'postLogin'
}

/**
 * The scope the cooldown applies to.
 */
export const enum BucketScope {
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

export const enum RegisterBehavior {
	Overwrite = 'OVERWRITE',
	LogToConsole = 'LOG_TO_CONSOLE'
}

export const enum InternalRegistryAPIType {
	ChatInput,
	ContextMenu
}
