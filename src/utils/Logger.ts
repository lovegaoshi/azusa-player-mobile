/* eslint-disable @typescript-eslint/no-explicit-any */
import { createStore } from 'zustand/vanilla';

export enum LOGLEVEL {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4,
  NONE = 5,
}

export interface log {
  level: string;
  msg: any;
}

export const logStore = createStore<{ logs: log[]; logLevel: number }>(() => ({
  logs: [],
  logLevel: LOGLEVEL.ERROR,
}));

export const getLog = () => {
  return logStore
    .getState()
    .logs.map(log => `${log.level}: ${log.msg}`)
    .join('\n');
};

export const resetLog = () => {
  logStore.setState({ logs: [] });
};

export const addLog = (level: string, msg: any) => {
  logStore.setState(state => ({
    logs: [{ level, msg: JSON.stringify(msg) }].concat(state.logs),
  }));
};

export const logger = {
  info: (msg: any) => {
    console.info(msg);
    if (logStore.getState().logLevel > LOGLEVEL.INFO) return;
    addLog('info', msg);
  },
  debug: (msg: any) => {
    console.debug(msg);
    if (logStore.getState().logLevel > LOGLEVEL.DEBUG) return;
    addLog('debug', msg);
  },
  log: (msg: any) => {
    console.log(msg);
    if (logStore.getState().logLevel > LOGLEVEL.INFO) return;
    addLog('log', msg);
  },
  error: (error: any) => {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(msg);
    if (logStore.getState().logLevel > LOGLEVEL.ERROR) return;
    addLog('error', msg);
  },
  warn: (msg: any) => {
    console.warn(msg);
    if (logStore.getState().logLevel > LOGLEVEL.WARN) return;
    addLog('warn', msg);
  },
};

export default logger;
