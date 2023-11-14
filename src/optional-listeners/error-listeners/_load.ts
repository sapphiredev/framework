import { container } from '@sapphire/pieces';
import { CoreListener as CoreChatInputCommandError } from './CoreChatInputCommandError';
import { CoreListener as CoreCommandApplicationCommandRegistryError } from './CoreCommandApplicationCommandRegistryError';
import { CoreListener as CoreCommandAutocompleteInteractionError } from './CoreCommandAutocompleteInteractionError';
import { CoreListener as CoreContextMenuCommandError } from './CoreContextMenuCommandError';
import { CoreListener as CoreInteractionHandlerError } from './CoreInteractionHandlerError';
import { CoreListener as CoreInteractionHandlerParseError } from './CoreInteractionHandlerParseError';
import { CoreListener as CoreListenerError } from './CoreListenerError';
import { CoreListener as CoreMessageCommandError } from './CoreMessageCommandError';

export function loadErrorListeners() {
	const store = 'listeners' as const;
	void container.stores.loadPiece({ name: 'CoreChatInputCommandError', piece: CoreChatInputCommandError, store });
	void container.stores.loadPiece({ name: 'CoreCommandApplicationCommandRegistryError', piece: CoreCommandApplicationCommandRegistryError, store });
	void container.stores.loadPiece({ name: 'CoreCommandAutocompleteInteractionError', piece: CoreCommandAutocompleteInteractionError, store });
	void container.stores.loadPiece({ name: 'CoreContextMenuCommandError', piece: CoreContextMenuCommandError, store });
	void container.stores.loadPiece({ name: 'CoreInteractionHandlerError', piece: CoreInteractionHandlerError, store });
	void container.stores.loadPiece({ name: 'CoreInteractionHandlerParseError', piece: CoreInteractionHandlerParseError, store });
	void container.stores.loadPiece({ name: 'CoreListenerError', piece: CoreListenerError, store });
	void container.stores.loadPiece({ name: 'CoreMessageCommandError', piece: CoreMessageCommandError, store });
}
