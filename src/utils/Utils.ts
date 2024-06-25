import { logger } from '@utils/Logger';

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
      Number(extractedRGB[2][0])
    );
  } catch {
    return rgb;
  }
};

export const getUniqObjects = <T>(
  objects: T[],
  property: (object: T) => string
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
  func: () => any = () => {}
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
  myFunc: (val: T) => K | undefined
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
  return '';
};
