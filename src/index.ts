import {
	acquire,
	getBulkOverwriteRetries,
	getDefaultBehaviorWhenNotIdentical,
	getDefaultGuildIds,
	registries,
	setBulkOverwriteRetries,
	setDefaultBehaviorWhenNotIdentical,
	setDefaultGuildIds
} from './lib/utils/application-commands/ApplicationCommandRegistries';
import type { ApplicationCommandRegistry } from './lib/utils/application-commands/ApplicationCommandRegistry';
import { CorePrecondition as ClientPermissions, type PermissionPreconditionContext } from './preconditions/ClientPermissions';
import { CorePrecondition as Cooldown, type CooldownPreconditionContext } from './preconditions/Cooldown';
import { CorePrecondition as Enabled } from './preconditions/Enabled';
import { CorePrecondition as NSFW } from './preconditions/NSFW';
import { CorePrecondition as RunIn } from './preconditions/RunIn';
import { CorePrecondition as UserPermissions } from './preconditions/UserPermissions';

const ApplicationCommandRegistries = {
	acquire,
	setDefaultBehaviorWhenNotIdentical,
	setDefaultGuildIds,
	setBulkOverwriteRetries,
	getDefaultGuildIds,
	getDefaultBehaviorWhenNotIdentical,
	getBulkOverwriteRetries,
	get registries(): ReadonlyMap<string, ApplicationCommandRegistry> {
		return registries;
	}
};

export {
	AliasPiece,
	AliasStore,
	container,
	LoaderError,
	MissingExportsError,
	Piece,
	Store,
	StoreRegistry,
	type AliasPieceJSON,
	type AliasPieceOptions,
	type Container,
	type LoaderPieceContext,
	type PieceJSON,
	type PieceLocationJSON,
	type PieceOf,
	type PieceOptions,
	type StoreManagerManuallyRegisteredPiece,
	type StoreManuallyRegisteredPiece,
	type StoreOf,
	type StoreOptions,
	type StoreRegistryEntries,
	type StoreRegistryKey,
	type StoreRegistryValue
} from '@sapphire/pieces';
export * from '@sapphire/result';
export type { Awaitable } from '@sapphire/utilities';
export * from './lib/errors/ArgumentError';
export * from './lib/errors/Identifiers';
export * from './lib/errors/PreconditionError';
export * from './lib/errors/UserError';
export * from './lib/parsers/Args';
export * from './lib/plugins/Plugin';
export * from './lib/plugins/PluginManager';
export * from './lib/plugins/symbols';
export * as PreconditionResolvers from './lib/precondition-resolvers/index';
export type { EmojiObject } from './lib/resolvers/emoji';
export * as Resolvers from './lib/resolvers/index';
export type { MessageResolverOptions } from './lib/resolvers/message';
export * from './lib/SapphireClient';
export * from './lib/structures/Argument';
export * from './lib/structures/ArgumentStore';
export * from './lib/structures/Command';
export * from './lib/structures/CommandStore';
export * from './lib/structures/InteractionHandler';
export * from './lib/structures/InteractionHandlerStore';
export * from './lib/structures/Listener';
export * from './lib/structures/ListenerLoaderStrategy';
export * from './lib/structures/ListenerStore';
export * from './lib/structures/Precondition';
export * from './lib/structures/PreconditionStore';
export type * from './lib/types/ArgumentContexts';
export type * from './lib/types/CommandTypes';
export * from './lib/types/Enums';
export * from './lib/types/Events';
export {
	ApplicationCommandRegistry,
	type ApplicationCommandRegistryRegisterOptions
} from './lib/utils/application-commands/ApplicationCommandRegistry';
export * from './lib/utils/logger/ILogger';
export * from './lib/utils/logger/Logger';
export type * from './lib/utils/preconditions/conditions/IPreconditionCondition';
export * from './lib/utils/preconditions/conditions/PreconditionConditionAnd';
export * from './lib/utils/preconditions/conditions/PreconditionConditionOr';
export * from './lib/utils/preconditions/containers/ClientPermissionsPrecondition';
export * from './lib/utils/preconditions/containers/UserPermissionsPrecondition';
export type * from './lib/utils/preconditions/IPreconditionContainer';
export * from './lib/utils/preconditions/PreconditionContainerArray';
export * from './lib/utils/preconditions/PreconditionContainerSingle';
export { ApplicationCommandRegistries };

export const CorePreconditions = {
	ClientPermissions,
	Cooldown,
	Enabled,
	RunIn,
	NSFW,
	UserPermissions
};

export declare namespace CorePreconditions {
	export type UserPermissionsPreconditionContext = PermissionPreconditionContext;
	export type CooldownContext = CooldownPreconditionContext;
}

/**
 * The [`@sapphire/framework`](https://github.com/sapphiredev/framework) version that you are currently using.
 * An example use of this is showing it of in a bot information command.
 *
 * Note to Sapphire developers: This needs to explicitly be `string` so it is not typed as the string that gets replaced by Rolldown
 */
// eslint-disable-next-line @typescript-eslint/no-inferrable-types
export const version: string = '[VI]{{inject}}[/VI]';
