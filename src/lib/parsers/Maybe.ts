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

/**
 * Returns the maybe itself.
 * @param value The value to convert.
 */
export function maybe<T, V extends Maybe<T>>(value: V): V;
/**
 * Creates a {@link None} from an existing {@link None} or a `null`.
 * @param value The value to convert.
 */
export function maybe(value: null | None): None;
/**
 * Creates a {@link Some} from a non-null value or an existing {@link Some}, or a {@link None} otherwise.
 * @param value The value to convert.
 */
export function maybe<T>(value: T | Maybe<T> | null): Maybe<T>;
/**
 * Creates a {@link Some} from a non-null value or an existing {@link Some}.
 * @param value The value to convert.
 */
export function maybe<T>(value: T | Some<T>): Some<T>;
export function maybe<T>(value: T | Maybe<T> | null): Maybe<T> {
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

/**
 * Type-safe helper to preserve the type parameter's type.
 * @param x The value to check.
 */
export function isMaybe<T>(x: Maybe<T>): true;
/**
 * Determines whether or not an arbitrary value is a Maybe.
 * @param x The value to check.
 */
export function isMaybe<T>(x: unknown): x is Maybe<T>;
export function isMaybe<T>(x: Maybe<T> | unknown): x is Maybe<T> {
	return typeof x === 'object' && x !== null && typeof Reflect.get(x, 'exists') === 'boolean';
}
