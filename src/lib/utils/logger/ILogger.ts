export const enum LogLevel {
	Trace = 10,
	Debug = 20,
	Info = 30,
	Warn = 40,
	Error = 50,
	Fatal = 60,
	None = 100
}

export interface ILogger {
	trace(...values: readonly unknown[]): void;
	debug(...values: readonly unknown[]): void;
	info(...values: readonly unknown[]): void;
	warn(...values: readonly unknown[]): void;
	error(...values: readonly unknown[]): void;
	fatal(...values: readonly unknown[]): void;
	write(level: LogLevel, ...values: readonly unknown[]): void;
}
