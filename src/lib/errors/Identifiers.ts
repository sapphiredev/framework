export enum Identifiers {
	ArgsMissing = 'argsMissing',
	ArgsUnavailable = 'argsUnavailable',

	ArgumentBooleanError = 'booleanError',
	ArgumentChannelError = 'channelError',
	ArgumentDMChannelError = 'dmChannelError',
	ArgumentDateError = 'dateError',
	ArgumentDateTooEarly = 'dateTooEarly',
	ArgumentDateTooFar = 'dateTooFar',
	ArgumentEmojiError = 'emojiError',
	ArgumentEnumEmptyError = 'enumEmptyError',
	ArgumentEnumError = 'enumError',
	ArgumentFloatError = 'floatError',
	ArgumentFloatTooLarge = 'floatTooLarge',
	ArgumentFloatTooSmall = 'floatTooSmall',
	ArgumentGuildCategoryChannelError = 'categoryChannelError',
	ArgumentGuildChannelError = 'guildChannelError',
	ArgumentGuildChannelMissingGuildError = 'guildChannelMissingGuildError',
	ArgumentGuildError = 'guildError',
	ArgumentGuildNewsChannelError = 'guildNewsChannelError',
	ArgumentGuildNewsThreadChannelError = 'guildNewsThreadChannelError',
	ArgumentGuildPrivateThreadChannelError = 'guildPrivateThreadChannelError',
	ArgumentGuildPublicThreadChannelError = 'guildPublicThreadChannelError',
	ArgumentGuildStageVoiceChannelError = 'guildStageVoiceChannelError',
	ArgumentGuildTextChannelError = 'guildTextChannelError',
	ArgumentGuildThreadChannelError = 'guildThreadChannelError',
	ArgumentGuildVoiceChannelError = 'guildVoiceChannelError',
	ArgumentHyperlinkError = 'hyperlinkError',
	ArgumentIntegerError = 'integerError',
	ArgumentIntegerTooLarge = 'integerTooLarge',
	ArgumentIntegerTooSmall = 'integerTooSmall',
	ArgumentMemberError = 'memberError',
	ArgumentMemberMissingGuild = 'memberMissingGuild',
	ArgumentMessageError = 'messageError',
	ArgumentNumberError = 'numberError',
	ArgumentNumberTooLarge = 'numberTooLarge',
	ArgumentNumberTooSmall = 'numberTooSmall',
	ArgumentRoleError = 'roleError',
	ArgumentRoleMissingGuild = 'roleMissingGuild',
	ArgumentStringTooLong = 'stringTooLong',
	ArgumentStringTooShort = 'stringTooShort',
	ArgumentUserError = 'userError',

	CommandDisabled = 'commandDisabled',

	PreconditionClientPermissions = 'preconditionClientPermissions',
	PreconditionClientPermissionsNoClient = 'preconditionClientPermissionsNoClient',
	PreconditionClientPermissionsNoPermissions = 'preconditionClientPermissionsNoPermissions',
	PreconditionCooldown = 'preconditionCooldown',
	/**
	 * @deprecated Use {@link PreconditionRunIn} instead.
	 */
	PreconditionDMOnly = 'preconditionDmOnly',
	/**
	 * @deprecated Use {@link PreconditionRunIn} instead.
	 */
	PreconditionGuildNewsOnly = 'preconditionGuildNewsOnly',
	/**
	 * @deprecated Use {@link PreconditionRunIn} instead.
	 */
	PreconditionGuildNewsThreadOnly = 'preconditionGuildNewsThreadOnly',
	/**
	 * @deprecated Use {@link PreconditionRunIn} instead.
	 */
	PreconditionGuildOnly = 'preconditionGuildOnly',
	/**
	 * @deprecated Use {@link PreconditionRunIn} instead.
	 */
	PreconditionGuildPrivateThreadOnly = 'preconditionGuildPrivateThreadOnly',
	/**
	 * @deprecated Use {@link PreconditionRunIn} instead.
	 */
	PreconditionGuildPublicThreadOnly = 'preconditionGuildPublicThreadOnly',
	/**
	 * @deprecated Use {@link PreconditionRunIn} instead.
	 */
	PreconditionGuildTextOnly = 'preconditionGuildTextOnly',
	/**
	 * @deprecated Use {@link PreconditionRunIn} instead.
	 */
	PreconditionGuildVoiceOnly = 'preconditionGuildVoiceOnly',
	PreconditionMissingChatInputHandler = 'preconditionMissingChatInputHandler',
	PreconditionMissingContextMenuHandler = 'preconditionMissingContextMenuHandler',
	PreconditionMissingMessageHandler = 'preconditionMissingMessageHandler',
	PreconditionNSFW = 'preconditionNsfw',
	PreconditionRunIn = 'preconditionRunIn',
	/**
	 * @deprecated Use {@link PreconditionRunIn} instead.
	 */
	PreconditionThreadOnly = 'preconditionThreadOnly',

	PreconditionUnavailable = 'preconditionUnavailable',
	PreconditionUserPermissions = 'preconditionUserPermissions',
	PreconditionUserPermissionsNoPermissions = 'preconditionUserPermissionsNoPermissions'
}
