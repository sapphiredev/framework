import type { option } from 'lexure';

/**
 * A type used to express a value that may or may not exist.
 * @typeparam T The value's type.
 */
export type Maybe<T> = Some<T> | None;

/**
 * A value that exists.
 * @typeparam T The value's type.
 */
export type Some<T> = option.Some<T>;

/**
 * An empty value.
 */
export type None = option.None;

export function maybe(value: null | None): None;
export function maybe<T>(value: T | null | Maybe<T>): Maybe<T>;
export function maybe<T>(value: T | Some<T>): Some<T>;
export function maybe<T>(value: T | null | Maybe<T>): Maybe<T> {
	return isMaybe(value) ? value : value === null ? none() : some(value);
}

/**
 * Creates a None with no value.
 * @return An existing Maybe.
 */
export function some(): Some<unknown>;
/**
 * Creates a None with a value.
 * @typeparam T The value's type.
 * @param x Value to use.
 * @return An existing Maybe.
 */
export function some<T>(x: T): Some<T>;
export function some<T>(x?: T): Some<unknown> {
	return { exists: true, value: x };
}

/**
 * Creates a None value.
 * @return A non-existing Maybe.
 */
export function none(): None {
	return { exists: false };
}

/**
 * Determines whether or not a Maybe is a Some.
 * @typeparam T The value's type.
 */
export function isSome<T>(x: Maybe<T>): x is Some<T> {
	return x.exists;
}

/**
 * Determines whether or not a Maybe is a None.
 * @typeparam T The value's type.
 */
export function isNone<T>(x: Maybe<T>): x is None {
	return !x.exists;
}

export function isMaybe<T>(x: unknown): x is Maybe<T> {
	return typeof x === 'object' && x !== null && typeof Reflect.get(x, 'exists') === 'boolean';
}
