/**
 * MIT License
 *
 * Copyright (c) 2018-2020 Kyra
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * Utility to make a class decorator with lighter syntax and inferred types.
 * @since 1.0.0
 * @copyright 2018-2020 Kyra
 * @license MIT
 * @param fn The class to decorate
 */
export function createClassDecorator<TFunction extends (...args: any[]) => void>(fn: TFunction): ClassDecorator {
	return fn;
}

/**
 * Creates a new proxy to efficiently add properties to class without creating subclasses
 * @since 1.0.0
 * @copyright 2018-2020 Kyra
 * @license MIT
 * @param target The constructor of the class to modify
 * @param handler The handler function to modify the constructor behaviour for the target
 * @hidden
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function createProxy<T extends object>(target: T, handler: Omit<ProxyHandler<T>, 'get'>): T {
	return new Proxy(target, {
		...handler,
		get: (target, property) => {
			const value = Reflect.get(target, property);
			return typeof value === 'function' ? (...args: readonly unknown[]) => value.apply(target, args) : value;
		}
	});
}
