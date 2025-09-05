/**
 * Conditional logging utility that only logs in development mode
 * In production, console.log calls are automatically removed by Vite
 */
const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args: any[]) => {
    if (isDev) {
      console.log(...args);
    }
  },
  info: (...args: any[]) => {
    if (isDev) {
      console.info(...args);
    }
  },
  warn: (...args: any[]) => {
    console.warn(...args); // Keep warnings in production
  },
  error: (...args: any[]) => {
    console.error(...args); // Keep errors in production
  },
  debug: (...args: any[]) => {
    if (isDev) {
      console.debug(...args);
    }
  }
};