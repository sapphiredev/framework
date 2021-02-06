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

/**
 * The scope at which permissions should be calculated
 */
export const enum PermissionScope {
	/**
	 * Per-channel permissions, factoring in overwrites
	 */
	Channel = 'channel',
	/**
	 * Guild-wide permissions, based on role permissions
	 */
	Guild = 'guild'
}

export const enum PermissionTarget {
	/**
	 * Check the permissions of the message author
	 */
	Author = 'author',
	/**
	 * Check the permissions of the client user
	 */
	Client = 'client'
}
