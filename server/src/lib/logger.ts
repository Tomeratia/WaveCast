type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  const timestamp = new Date().toISOString();
  const entry = { timestamp, level, message, ...meta };

  switch (level) {
    case 'error':
      console.error(JSON.stringify(entry));
      break;
    case 'warn':
      console.warn(JSON.stringify(entry));
      break;
    case 'debug':
      if (process.env['NODE_ENV'] === 'development') {
        console.debug(JSON.stringify(entry));
      }
      break;
    default:
      console.log(JSON.stringify(entry));
  }
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => log('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log('error', message, meta),
  debug: (message: string, meta?: Record<string, unknown>) => log('debug', message, meta),
};
