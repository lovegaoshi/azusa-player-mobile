import { createStore } from 'zustand/vanilla';

export interface log {
  level: string;
  msg: any;
}

const logStore = createStore<{ logs: log[] }>(() => ({
  logs: [],
}));

export const getLog = () => {
  return logStore
    .getState()
    .logs.map(log => `${log.level}: ${log.msg}`)
    .join('\n');
};

export const addLog = (level: string, msg: any) => {
  logStore.setState(state => {
    return {
      logs: [{ level, msg: JSON.stringify(msg) }].concat(state.logs),
    };
  });
};

export const logger = {
  info: (msg: any) => {
    console.info(msg);
    addLog('info', msg);
  },
  debug: (msg: any) => {
    console.debug(msg);
    addLog('debug', msg);
  },
  log: (msg: any) => {
    console.log(msg);
    addLog('log', msg);
  },
  error: (msg: any) => {
    console.error(msg);
    addLog('error', msg);
  },
  warn: (msg: any) => {
    console.warn(msg);
    addLog('warn', msg);
  },
};
