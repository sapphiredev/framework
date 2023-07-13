import type { MessageResolverOptions } from '../resolvers/message';
import type { Argument } from '../structures/Argument';

/**
 * The context for the `'enum'` argument.
 * @since 4.2.0 (🌿)
 */
export interface EnumArgumentContext extends Argument.MessageContext {
	readonly enum?: string[];
	readonly caseInsensitive?: boolean;
}

/**
 * The context for the `'boolean'` argument.
 * @since 4.2.0 (🌿)
 */
export interface BooleanArgumentContext extends Argument.MessageContext {
	/**
	 * The words that resolve to `true`.
	 * Any words added to this array will be merged with the words:
	 * ```ts
	 * ['1', 'true', '+', 't', 'yes', 'y']
	 * ```
	 */
	readonly truths?: string[];
	/**
	 * The words that resolve to `false`.
	 * Any words added to this array will be merged with the words:
	 * ```ts
	 * ['0', 'false', '-', 'f', 'no', 'n']
	 * ```
	 */
	readonly falses?: string[];
}

/**
 * The context for the `'member'` argument.
 * @since 4.2.0 (🌿)
 */
export interface MemberArgumentContext extends Argument.MessageContext {
	/**
	 * Whether to perform a fuzzy search with the given argument.
	 * This will leverage `FetchMembersOptions.query` to do the fuzzy searching.
	 * @default true
	 */
	readonly performFuzzySearch?: boolean;
}

/**
 * The context for the `'message'` argument.
 * @since 4.2.0 (🌿)
 */
export type MessageArgumentContext = Omit<MessageResolverOptions, 'messageOrInteraction'> & Argument.MessageContext;
