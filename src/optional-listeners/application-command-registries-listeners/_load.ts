import { container } from '@sapphire/pieces';
import { CoreListener as CoreApplicationCommandRegistriesInitialising } from './CoreApplicationCommandRegistriesInitialising';
import { CoreListener as CoreApplicationCommandRegistriesRegistered } from './CoreApplicationCommandRegistriesRegistered';

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
}
