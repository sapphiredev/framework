import { ApplicationCommandRegistry } from './ApplicationCommandRegistry';

export const registries = new Map<string, ApplicationCommandRegistry>();

export function acquire(commandName: string) {
	const existing = registries.get(commandName);
	if (existing) {
		return existing;
	}

	const newRegistry = new ApplicationCommandRegistry(commandName);
	registries.set(commandName, newRegistry);

	return newRegistry;
}

export async function handleRegistryAPICalls() {
	for (const registry of registries.values()) {
		// eslint-disable-next-line @typescript-eslint/dot-notation
		await registry['runAPICalls']();
	}
}
