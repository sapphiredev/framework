import { Awaitable, isFunction } from '@sapphire/utilities';
import type * as Lexure from 'lexure';

/**
 * A type used to express computations that can fail.
 * @typeparam T The result's type.
 * @typeparam E The error's type.
 */
export type Result<T, E> = Ok<T> | Err<E>;

/**
 * The computation is successful.
 * @typeparam T Type of results.
 */
export type Ok<T> = Lexure.Ok<T>;

/**
 * The computation failed.
 * @typeparam E Type of errors.
 */
export type Err<E> = Lexure.Err<E>;

/**
 * Creates an Ok with no value.
 * @return A successful Result.
 */
export function ok(): Ok<unknown>;
/**
 * Creates an Ok.
 * @typeparam T The result's type.
 * @param x Value to use.
 * @return A successful Result.
 */
export function ok<T>(x: T): Ok<T>;
export function ok<T>(x?: T): Ok<unknown> {
	return { success: true, value: x };
}

/**
 * Creates an Err with no error.
 * @return An erroneous Result.
 */
export function err(): Err<unknown>;
/**
 * Creates an Err.
 * @typeparam E The error's type.
 * @param x Value to use.
 * @return An erroneous Result.
 */
export function err<E>(x: E): Err<E>;
export function err<E>(x?: E): Err<unknown> {
	return { success: false, error: x };
}

/**
 * Determines whether or not a result is an Ok.
 * @typeparam T The result's type.
 * @typeparam E The error's type.
 */
export function isOk<T, E>(x: Result<T, E>): x is Ok<T> {
	return x.success;
}

/**
 * Determines whether or not a result is an Err.
 * @typeparam T The result's type.
 * @typeparam E The error's type.
 */
export function isErr<T, E>(x: Result<T, E>): x is Err<E> {
	return !x.success;
}

/**
 * Creates a {@link Result} out of a callback.
 * @typeparam T The result's type.
 * @typeparam E The error's type.
 */
export function from<T, E = unknown>(cb: (...args: unknown[]) => T): Result<T, E> {
	try {
		return ok(cb());
	} catch (error) {
		return err(error as E);
	}
}

/**
 * Creates a {@link Result} out of a promise or async callback.
 * @typeparam T The result's type.
 * @typeparam E The error's type.
 */
export async function fromAsync<T, E = unknown>(promiseOrCb: Awaitable<T> | ((...args: unknown[]) => Awaitable<T>)): Promise<Result<T, E>> {
	try {
		return ok(await (isFunction(promiseOrCb) ? promiseOrCb() : promiseOrCb));
	} catch (error) {
		return err(error as E);
	}
}
