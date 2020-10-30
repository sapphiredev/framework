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
 * The level the cooldown applies to
 */
export const enum BucketType {
	/**
	 * Per channel cooldowns
	 */
	Channel,
	/**
	 * Global cooldowns
	 */
	Global,
	/**
	 * Per guild cooldowns
	 */
	Guild,
	/**
	 * Per user cooldowns
	 */
	User
}
