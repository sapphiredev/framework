import type { Constructor } from '@klasa/core';
import { createClassDecorator, createProxy } from '@skyra/decorators';
import type { Monitor } from '../../structures/Monitor';

/**
 * @since 1.0.0
 * @param prop The property on which the status should be assigned.
 * @param status Wheter the property should be ignored or not.
 */
export function monitorIgnoreOptions(prop: string, status?: boolean) {
	return createClassDecorator((target: Constructor<Monitor>) =>
		createProxy(target, {
			construct: (ctor, [store, directory, files, options]): Monitor => {
				const command = new ctor(store, directory, files, options);
				Reflect.defineProperty(command, prop, {
					value: status ?? false,
					enumerable: true,
					configurable: true,
					writable: true
				});
				return command;
			}
		})
	);
}

/**
 * Should the decorated monitor ignore bots.
 * @since 1.0.0
 */
export const ignoreBots = (status?: boolean) => monitorIgnoreOptions('ignoreBots', status);

/**
 * Should the decorated monitor ignore users.
 * @since 1.0.0
 */
export const ignoreUsers = (status?: boolean) => monitorIgnoreOptions('ignoreUsers', status);

/**
 * Should the decorated monitor ignore its self.
 * @since 1.0.0
 */
export const ignoreSelf = (status?: boolean) => monitorIgnoreOptions('ignoreSelf', status);

/**
 * Should the decorated monitor ignore others.
 * @since 1.0.0
 */
export const ignoreOthers = (status?: boolean) => monitorIgnoreOptions('ignoreOthers', status);

/**
 * Should the decorated monitor ignore webhooks.
 * @since 1.0.0
 */
export const ignoreWebhooks = (status?: boolean) => monitorIgnoreOptions('ignoreWebhooks', status);

/**
 * Should the decorated monitor ignore edits.
 * @since 1.0.0
 */
export const ignoreEdits = (status?: boolean) => monitorIgnoreOptions('ignoreEdits', status);
