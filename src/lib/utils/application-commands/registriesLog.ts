import { container } from '@sapphire/pieces';

export function bulkOverwriteInfo(message: string, ...other: unknown[]) {
	container.logger.info(`ApplicationCommandRegistries(BulkOverwrite) ${message}`, ...other);
}

export function bulkOverwriteError(message: string, ...other: unknown[]) {
	container.logger.error(`ApplicationCommandRegistries(BulkOverwrite) ${message}`, ...other);
}

export function bulkOverwriteWarn(message: string, ...other: unknown[]) {
	container.logger.warn(`ApplicationCommandRegistries(BulkOverwrite) ${message}`, ...other);
}

export function bulkOverwriteDebug(message: string, ...other: unknown[]) {
	container.logger.debug(`ApplicationCommandRegistries(BulkOverwrite) ${message}`, ...other);
}
