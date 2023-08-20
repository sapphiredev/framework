export enum Identifiers {
	ArgsMissing = 'argsMissing',
	ArgsUnavailable = 'argsUnavailable',

	ArgumentBooleanError = 'booleanError',
	ArgumentChannelError = 'channelError',
	ArgumentDateError = 'dateError',
	ArgumentDateTooEarly = 'dateTooEarly',
	ArgumentDateTooFar = 'dateTooFar',
	ArgumentDMChannelError = 'dmChannelError',
	ArgumentEmojiError = 'emojiError',
	ArgumentFloatError = 'floatError',
	ArgumentFloatTooLarge = 'floatTooLarge',
	ArgumentFloatTooSmall = 'floatTooSmall',
	ArgumentGuildError = 'guildError',
	ArgumentGuildCategoryChannelError = 'categoryChannelError',
	ArgumentGuildChannelError = 'guildChannelError',
	ArgumentGuildChannelMissingGuildError = 'guildChannelMissingGuildError',
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
	ArgumentEnumEmptyError = 'enumEmptyError',
	ArgumentEnumError = 'enumError',

	CommandDisabled = 'commandDisabled',

	PreconditionCooldown = 'preconditionCooldown',
	/** @deprecated Use {@link PreconditionRunIn} instead. */
	PreconditionDMOnly = 'preconditionDmOnly',
	/** @deprecated Use {@link PreconditionRunIn} instead. */
	PreconditionGuildNewsOnly = 'preconditionGuildNewsOnly',
	/** @deprecated Use {@link PreconditionRunIn} instead. */
	PreconditionGuildNewsThreadOnly = 'preconditionGuildNewsThreadOnly',
	/** @deprecated Use {@link PreconditionRunIn} instead. */
	PreconditionGuildOnly = 'preconditionGuildOnly',
	/** @deprecated Use {@link PreconditionRunIn} instead. */
	PreconditionGuildPrivateThreadOnly = 'preconditionGuildPrivateThreadOnly',
	/** @deprecated Use {@link PreconditionRunIn} instead. */
	PreconditionGuildPublicThreadOnly = 'preconditionGuildPublicThreadOnly',
	/** @deprecated Use {@link PreconditionRunIn} instead. */
	PreconditionGuildTextOnly = 'preconditionGuildTextOnly',
	/** @deprecated Use {@link PreconditionRunIn} instead. */
	PreconditionGuildVoiceOnly = 'preconditionGuildVoiceOnly',
	PreconditionNSFW = 'preconditionNsfw',
	PreconditionClientPermissions = 'preconditionClientPermissions',
	PreconditionClientPermissionsNoClient = 'preconditionClientPermissionsNoClient',
	PreconditionClientPermissionsNoPermissions = 'preconditionClientPermissionsNoPermissions',
	PreconditionRunIn = 'preconditionRunIn',
	PreconditionUserPermissions = 'preconditionUserPermissions',
	PreconditionUserPermissionsNoPermissions = 'preconditionUserPermissionsNoPermissions',
	/** @deprecated Use {@link PreconditionRunIn} instead. */
	PreconditionThreadOnly = 'preconditionThreadOnly',

	PreconditionUnavailable = 'preconditionUnavailable',

	PreconditionMissingMessageHandler = 'preconditionMissingMessageHandler',
	PreconditionMissingChatInputHandler = 'preconditionMissingChatInputHandler',
	PreconditionMissingContextMenuHandler = 'preconditionMissingContextMenuHandler'
}
