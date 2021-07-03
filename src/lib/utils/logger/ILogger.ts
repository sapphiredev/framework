/**
 * The logger levels for the {@link ILogger}.
 */
export const enum LogLevel {
	/**
	 * The lowest log level, used when calling {@link ILogger.trace}.
	 */
	Trace = 10,

	/**
	 * The debug level, used when calling {@link ILogger.debug}.
	 */
	Debug = 20,

	/**
	 * The info level, used when calling {@link ILogger.info}.
	 */
	Info = 30,

	/**
	 * The warning level, used when calling {@link ILogger.warn}.
	 */
	Warn = 40,

	/**
	 * The error level, used when calling {@link ILogger.error}.
	 */
	Error = 50,

	/**
	 * The critical level, used when calling {@link ILogger.fatal}.
	 */
	Fatal = 60,

	/**
	 * An unknown or uncategorized level.
	 */
	None = 100
}

export interface ILogger {
	/**
	 * Checks whether a level is supported.
	 * @param level The level to check.
	 */
	has(level: LogLevel): boolean;

	/**
	 * Alias of {@link ILogger.write} with {@link LogLevel.Trace} as level.
	 * @param values The values to log.
	 */
	trace(...values: readonly unknown[]): void;

	/**
	 * Alias of {@link ILogger.write} with {@link LogLevel.Debug} as level.
	 * @param values The values to log.
	 */
	debug(...values: readonly unknown[]): void;

	/**
	 * Alias of {@link ILogger.write} with {@link LogLevel.Info} as level.
	 * @param values The values to log.
	 */
	info(...values: readonly unknown[]): void;

	/**
	 * Alias of {@link ILogger.write} with {@link LogLevel.Warn} as level.
	 * @param values The values to log.
	 */
	warn(...values: readonly unknown[]): void;

	/**
	 * Alias of {@link ILogger.write} with {@link LogLevel.Error} as level.
	 * @param values The values to log.
	 */
	error(...values: readonly unknown[]): void;

	/**
	 * Alias of {@link ILogger.write} with {@link LogLevel.Fatal} as level.
	 * @param values The values to log.
	 */
	fatal(...values: readonly unknown[]): void;

	/**
	 * Writes the log message given a level and the value(s).
	 * @param level The log level.
	 * @param values The values to log.
	 */
	write(level: LogLevel, ...values: readonly unknown[]): void;
}
