export type LogLevel = "info" | "warn" | "error";
export interface LogEntry { readonly level: LogLevel; readonly message: string; readonly context?: Readonly<Record<string, unknown>>; readonly timestamp: string; }
export interface Logger { info(message: string, context?: Readonly<Record<string, unknown>>): void; warn(message: string, context?: Readonly<Record<string, unknown>>): void; error(message: string, context?: Readonly<Record<string, unknown>>): void; }
type LogSink = (entry: LogEntry) => void;
const sensitiveKey = /password|token|secret|authorization|cookie/i;
const sanitizeContext = (context: Readonly<Record<string, unknown>>): Readonly<Record<string, unknown>> => Object.fromEntries(Object.entries(context).map(([key, value]) => [key, sensitiveKey.test(key) ? "[REDACTED]" : value]));
export const createStructuredLogger = (sink: LogSink = (entry) => console.log(JSON.stringify(entry))): Logger => {
  const write = (level: LogLevel, message: string, context?: Readonly<Record<string, unknown>>): void => sink({ level, message, timestamp: new Date().toISOString(), ...(context ? { context: sanitizeContext(context) } : {}) });
  return { info: (message, context) => write("info", message, context), warn: (message, context) => write("warn", message, context), error: (message, context) => write("error", message, context) };
};
export const createConsoleLogger = (): Logger => createStructuredLogger();
