// TODO(vladfrangu): Delete this type when we upgrade to TS 4.5, or move it to @utilities
/**
 * Recursively unwraps the "awaited type" of a type. Non-promise "thenables" should resolve to `never`. This emulates the behavior of `await`.
 */
export type Awaited<T> = T extends null | undefined
	? T // special case for `null | undefined` when not in `--strictNullChecks` mode
	: // eslint-disable-next-line @typescript-eslint/ban-types
	T extends object & { then(onfulfilled: infer F): any } // `await` only unwraps object types with a callable `then`. Non-object types are not unwrapped
	? F extends (value: infer V) => any // if the argument to `then` is callable, extracts the argument
		? Awaited<V> // recursively unwrap the value
		: never // the argument to `then` was not callable
	: T; // non-object or non-thenable
