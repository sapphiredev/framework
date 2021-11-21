export {
	AliasPiece,
	AliasPieceOptions,
	AliasStore,
	container,
	LoaderError,
	MissingExportsError,
	Piece,
	PieceContext,
	PieceOptions,
	Store,
	StoreOptions,
	StoreRegistry,
	StoreRegistryEntries
} from '@sapphire/pieces';
export type { Awaitable } from '@sapphire/utilities';
export * from './lib/errors/ArgumentError';
export * from './lib/errors/Identifiers';
export * from './lib/errors/PreconditionError';
export * from './lib/errors/UserError';
export * from './lib/parsers/Args';
export * from './lib/parsers/Maybe';
export * from './lib/parsers/Result';
export * from './lib/plugins/Plugin';
export * from './lib/plugins/PluginManager';
export * from './lib/plugins/symbols';
export * as Resolvers from './lib/resolvers';
export * from './lib/SapphireClient';
export * from './lib/structures/Argument';
export * from './lib/structures/ArgumentStore';
export * from './lib/structures/Command';
export * from './lib/structures/CommandStore';
export * from './lib/structures/ExtendedArgument';
export * from './lib/structures/Listener';
export * from './lib/structures/ListenerStore';
export * from './lib/structures/Precondition';
export * from './lib/structures/PreconditionStore';
export * from './lib/types/Enums';
export * from './lib/types/Events';
export * from './lib/utils/logger/ILogger';
export * from './lib/utils/logger/Logger';
export * from './lib/utils/preconditions/conditions/IPreconditionCondition';
export * from './lib/utils/preconditions/conditions/PreconditionConditionAnd';
export * from './lib/utils/preconditions/conditions/PreconditionConditionOr';
export * from './lib/utils/preconditions/containers/ClientPermissionsPrecondition';
export * from './lib/utils/preconditions/containers/UserPermissionsPrecondition';
export * from './lib/utils/preconditions/IPreconditionContainer';
export * from './lib/utils/preconditions/PreconditionContainerArray';
export * from './lib/utils/preconditions/PreconditionContainerSingle';
export * as CorePreconditions from './preconditions';
/**
 * @deprecated. Please use `CorePreconditions.ClientPermissions`. `ClientPermissionsCorePrecondition` will be removed in v3.0.0
 */
export { CorePrecondition as ClientPermissionsCorePrecondition } from './preconditions/ClientPermissions';
export type { CooldownContext } from './preconditions/Cooldown';

/**
 * The [@sapphire/framework](https://github.com/sapphiredev/framework) version that you are currently using.
 * An example use of this is showing it of in a bot information command.
 *
 * Note to Sapphire developers: This needs to explicitly be `string` so it is not typed as the string that gets replaced by Rollup
 */
// eslint-disable-next-line @typescript-eslint/no-inferrable-types
export const version: string = '[VI]{version}[/VI]';
