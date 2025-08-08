/**
 * Logger utility for development and production
 */
const isDev = import.meta.env.DEV;

export const logger = {
  error: (message: string, ...args: unknown[]) => {
    console.error(message, ...args);
  },
  warn: (message: string, ...args: unknown[]) => {
    if (isDev) {
      console.warn(message, ...args);
    }
  },
  info: (message: string, ...args: unknown[]) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.log(message, ...args);
    }
  },
  debug: (message: string, ...args: unknown[]) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.debug(message, ...args);
    }
  },
};
