import { container } from '@sapphire/pieces';
import { CoreListener as CoreMessageCommandAccepted } from './CoreMessageCommandAccepted';
import { CoreListener as CoreMessageCommandTyping } from './CoreMessageCommandTyping';
import { CoreListener as CoreMessageCreate } from './CoreMessageCreate';
import { CoreListener as CorePreMessageCommandRun } from './CorePreMessageCommandRun';
import { CoreListener as CorePreMessageParser } from './CorePreMessageParser';
import { CoreListener as CorePrefixedMessage } from './CorePrefixedMessage';

export function loadMessageCommandListeners() {
	const store = 'listeners' as const;
	void container.stores.loadPiece({ name: 'CoreMessageCommandAccepted', piece: CoreMessageCommandAccepted, store });
	void container.stores.loadPiece({ name: 'CoreMessageCommandTyping', piece: CoreMessageCommandTyping, store });
	void container.stores.loadPiece({ name: 'CoreMessageCreate', piece: CoreMessageCreate, store });
	void container.stores.loadPiece({ name: 'CorePrefixedMessage', piece: CorePrefixedMessage, store });
	void container.stores.loadPiece({ name: 'CorePreMessageCommandRun', piece: CorePreMessageCommandRun, store });
	void container.stores.loadPiece({ name: 'CorePreMessageParser', piece: CorePreMessageParser, store });
}
