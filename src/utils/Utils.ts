import pickBy from 'lodash/pickBy';

import { logger } from '@utils/Logger';

export function nFormatter(num: number, digits: number = 1) {
  const lookup = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'k' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'G' },
    { value: 1e12, symbol: 'T' },
    { value: 1e15, symbol: 'P' },
    { value: 1e18, symbol: 'E' },
  ];
  const regexp = /\.0+$|(?<=\.[0-9]*[1-9])0+$/;
  const item = lookup
    .slice()
    .reverse()
    .find(item => num >= item.value);
  return item
    ? (num / item.value).toFixed(digits).replace(regexp, '').concat(item.symbol)
    : '0';
}

export const appendURLSearchParam = (
  api: string,
  urlParam: URLSearchParams,
  kw: string,
) => {
  const extracted = urlParam.get(kw);
  return extracted ? `${api}&${kw}=${extracted}` : api;
};

export const i0hdslbHTTPResolve = (url: string) =>
  url.replace('http://', 'https://');

export const seconds2HHMMSS = (sec_num: number) => {
  sec_num = Math.floor(sec_num);
  const padding = (num: number) => String(num).padStart(2, '0');
  const hours = Math.floor(sec_num / 3600);
  const minutes = Math.floor((sec_num - hours * 3600) / 60);
  const seconds = sec_num - hours * 3600 - minutes * 60;
  return `${padding(hours)}:${padding(minutes)}:${padding(seconds)}`;
};

export const seconds2MMSS = (sec_num: number) => {
  sec_num = Math.floor(sec_num);
  const padding = (num: number) => String(num).padStart(2, '0');
  const hours = Math.floor(sec_num / 3600);
  const minutes = Math.floor((sec_num - hours * 3600) / 60);
  const seconds = sec_num - hours * 3600 - minutes * 60;
  return hours > 0
    ? `${String(hours)}:${padding(minutes)}:${padding(seconds)}`
    : `${padding(minutes)}:${padding(seconds)}`;
};

export const timestampToSeconds = (timestamp: string) => {
  try {
    const timeArray = timestamp.split(':').map(parseFloat);
    switch (timeArray.length) {
      case 1:
        return timeArray[0];
      case 2:
        return timeArray[0] * 60 + timeArray[1];
      case 3:
        return timeArray[0] * 3600 + timeArray[1] * 60 + timeArray[2];
    }
  } catch (e) {
    console.error(e);
  }
  return 0;
};

export const randomNumber = (v: number) => {
  return Math.floor(Math.random() * v) >> 0;
};

export const randomChoice = <T>(list: T[]) => {
  return list[randomNumber(list.length)];
};

export const weightedChoice = <T>(list: [T, number][]) => {
  const sum = list.reduce((a, b) => a + b[1], 0);
  const random = Math.random() * sum;
  let current = 0;
  for (const item of list) {
    current += item[1];
    if (current >= random) {
      return item[0];
    }
  }
  return list[0][0];
};

export const rgb2rgba = (rgb: string, a = 1) => {
  const extractedRGB = [...rgb.matchAll(/(\d+)/g)];
  return `rgba(${extractedRGB[0][0]}, ${extractedRGB[1][0]}, ${extractedRGB[2][0]}, ${a})`;
};

const rgbToHex = (r: number, g: number, b: number) =>
  '#' +
  [r, g, b]
    .map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    })
    .join('');

export const rgb2Hex = (rgb: string) => {
  try {
    const extractedRGB = [...rgb.matchAll(/(\d+)/g)];
    return rgbToHex(
      Number(extractedRGB[0][0]),
      Number(extractedRGB[1][0]),
      Number(extractedRGB[2][0]),
    );
  } catch {
    return rgb;
  }
};

export const getUniqObjects = <T>(
  objects: T[],
  property: (object: T) => string,
) => {
  const uniqKey = new Set();
  return objects.filter(object => {
    if (uniqKey.has(property(object))) {
      return false;
    }
    uniqKey.add(property(object));
    return true;
  });
};

/**
 * splits an array to chunks of given size.
 */
export const chunkArray = <T>(arr: T[], size = 400): T[][] => {
  return arr.reduce((chunks, item, index) => {
    const chunkIndex = Math.floor(index / size);
    if (!chunks[chunkIndex]) {
      chunks[chunkIndex] = [];
    }
    chunks[chunkIndex].push(item);
    return chunks;
  }, [] as T[][]);
};

export const charLength = (str: string) => {
  return str.replace(/[\u0300-\u036f]/g, '').length;
};

export const timeout = (
  delay: number,
  func: () => any = () => {},
): Promise<void> => {
  return new Promise(res => setTimeout(() => res(func()), delay));
};

interface RegexMatchOperationsProps<K, T> {
  song: K;
  regexOperations: [RegExp, (song: K) => T][];
  fallback: (song: K) => T;
  regexMatching: (song: K) => string;
}
export const regexMatchOperations = <K, T>({
  song,
  regexOperations,
  fallback,
  regexMatching,
}: RegexMatchOperationsProps<K, T>) => {
  const regexMatch = regexMatching(song);
  for (const reExtraction of regexOperations) {
    const reExtracted = reExtraction[0].exec(regexMatch);
    if (reExtracted !== null) {
      return reExtraction[1](song);
    }
  }
  return fallback(song);
};

interface AnyDict {
  [key: string]: never;
}
export const arrayToObject = (val: [string, never][]) =>
  val.reduce((acc, curr) => {
    acc[curr[0]] = curr[1];
    return acc;
  }, {} as AnyDict);

export const r128gain2Volume = (gain: number) => {
  if (gain > 0) {
    return 1;
  }
  return Math.pow(10, gain / 20);
};

export const filterUndefined = <T, K>(
  myArray: T[],
  myFunc: (val: T) => K | undefined,
) =>
  myArray.flatMap(v => {
    const val = myFunc(v);
    return val ? [val] : [];
  });

export const reorder = <T>(list: T[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  if (removed !== undefined) result.splice(endIndex, 0, removed);
  return result;
};

export const timeFunction = async <T>(fn: () => Promise<T>, log?: string) => {
  const start = Date.now();
  const result = await fn();
  const time = Date.now() - start;
  if (log) logger.debug(`[perf] ${log} took ${time}ms`);
  return {
    result,
    time,
  };
};

export const getExt = (url: string) => {
  const splitUrl = url.split('.');
  if (splitUrl.length > 1) return splitUrl.pop() as string;
};

interface ExecWhenTrue {
  loopCheck: () => Promise<boolean>;
  executeFn: () => unknown;
  wait?: number;
  loopGuard?: number;
  funcName?: string;
}
export const execWhenTrue = async ({
  loopCheck,
  executeFn,
  wait = 50,
  loopGuard = 100,
  funcName = '',
}: ExecWhenTrue) => {
  let loops = 0;
  while (!(await loopCheck())) {
    await timeout(wait);
    loops += 1;
    if (loops > loopGuard) {
      logger.error(
        `[ExecWhenTrue] function ${funcName} exceeded maxStack ${loopGuard}`,
      );
      return;
    }
  }
  executeFn();
  logger.debug(
    `[ExecWhenTrue] function ${funcName} executed after ${loops} try.`,
  );
};

export const shuffle = <T>(list: T[]) =>
  Array.from(list).sort(() => Math.random() - 0.5);

export const removeUndefined = (originalObject: any) =>
  pickBy(originalObject, v => v !== undefined);
