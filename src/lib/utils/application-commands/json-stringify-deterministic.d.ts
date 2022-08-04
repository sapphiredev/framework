declare module 'json-stringify-deterministic' {
	export interface StringifyOptions {
		stringify?: (value: any) => string;
		cycles?: boolean;
		compare: (a: any, b: any) => number;
		space?: string;
		replacer?: (key: string, value: any) => any;
	}

	function deterministicStringify(object: any, options?: StringifyOptions): string;

	export = deterministicStringify;
}
