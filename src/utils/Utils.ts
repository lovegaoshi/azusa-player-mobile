import Snackbar from 'react-native-snackbar';

import { logger } from './Logger';

interface SnackbarMsg {
  updating: string;
  updated: string;
  updateFail: string;
}
export const snackBarWrapper = async <T>(
  msg: SnackbarMsg,
  callback: () => Promise<T>
) => {
  try {
    Snackbar.show({
      text: msg.updating,
      duration: Snackbar.LENGTH_INDEFINITE,
    });
    const result = await callback();
    Snackbar.show({
      text: msg.updated,
    });
    return result;
  } catch (e) {
    logger.error(e);
    Snackbar.show({
      text: msg.updateFail,
    });
  }
};
export const i0hdslbHTTPResolve = (url: String) =>
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
  const timeArray = timestamp.split(':').map(parseFloat);
  let seconds = 0;
  if (timeArray.length === 1) {
    // check if both hours and minutes components are missing
    seconds = timeArray[0]; // the timestamp only contains seconds
  } else if (timeArray.length === 2) {
    // check if hours component is missing
    seconds = timeArray[0] * 60 + timeArray[1]; // calculate seconds from minutes and seconds
  } else if (timeArray.length === 3) {
    seconds = timeArray[0] * 3600 + timeArray[1] * 60 + timeArray[2]; // calculate total seconds
  }
  return seconds;
};

export function randomChoice<T>(list: Array<T>) {
  return list[Math.floor(Math.random() * list.length) >> 0];
}

export const rgb2rgba = (rgb: string, a = 1) => {
  const extractedRGB = [...rgb.matchAll(/(\d+)/g)];
  return `rgba(${extractedRGB[0][0]}, ${extractedRGB[1][0]}, ${extractedRGB[2][0]}, ${a})`;
};

export const getUniqObjects = <T>(
  objects: Array<T>,
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
 * @param arr
 * @param size
 * @returns
 */
export const chunkArray = <T>(arr: Array<T>, size: number): Array<T[]> => {
  return arr.reduce(
    (chunks, item, index) => {
      const chunkIndex = Math.floor(index / size);
      if (!chunks[chunkIndex]) {
        chunks[chunkIndex] = [];
      }
      chunks[chunkIndex].push(item);
      return chunks;
    },
    [] as Array<T[]>
  );
};

export const charLength = (str: string) => {
  return str.replace(/[\u0300-\u036f]/g, '').length;
};

export function timeout(delay: number) {
  return new Promise(res => setTimeout(res, delay));
}

interface regexMatchOperationsProps<K, T> {
  song: K;
  regexOperations: Array<[RegExp, (song: K) => Promise<T>]>;
  fallback: (song: K) => Promise<T>;
  regexMatching: (song: K) => string;
}
export const regexMatchOperations = <K, T>({
  song,
  regexOperations,
  fallback,
  regexMatching,
}: regexMatchOperationsProps<K, T>) => {
  for (const reExtraction of regexOperations) {
    const reExtracted = reExtraction[0].exec(regexMatching(song));
    if (reExtracted !== null) {
      return reExtraction[1](song);
    }
  }
  return fallback(song);
};
