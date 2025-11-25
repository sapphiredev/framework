import { container } from '@sapphire/pieces';
import { CoreListener as CoreApplicationCommandRegistriesInitialising } from './CoreApplicationCommandRegistriesInitialising';
import { CoreListener as CoreApplicationCommandRegistriesRegistered } from './CoreApplicationCommandRegistriesRegistered';
import { CoreListener as CoreApplicationCommandRegistriesBulkOverwrite } from './CoreApplicationCommandRegistriesBulkOverwrite';

export function loadApplicationCommandRegistriesListeners() {
	const store = 'listeners' as const;
	void container.stores.loadPiece({
		name: 'CoreApplicationCommandRegistriesInitialising',
		piece: CoreApplicationCommandRegistriesInitialising,
		store
	});
	void container.stores.loadPiece({
		name: 'CoreApplicationCommandRegistriesRegistered',
		piece: CoreApplicationCommandRegistriesRegistered,
		store
	});
	void container.stores.loadPiece({
		name: 'CoreApplicationCommandRegistriesBulkOverwrite',
		piece: CoreApplicationCommandRegistriesBulkOverwrite,
		store
	});
}
