import { Alert } from 'react-native';

export const seconds2HHMMSS = (sec_num: number) => {
  const padding = (num: number) => String(num).padStart(2, '0');
  const hours = Math.floor(sec_num / 3600);
  const minutes = Math.floor((sec_num - hours * 3600) / 60);
  const seconds = sec_num - hours * 3600 - minutes * 60;
  return `${padding(hours)}:${padding(minutes)}:${padding(seconds)}`;
};

export const seconds2MMSS = (sec_num: number) => {
  const padding = (num: number) => String(num).padStart(2, '0');
  const hours = Math.floor(sec_num / 3600);
  const minutes = Math.floor((sec_num - hours * 3600) / 60);
  const seconds = sec_num - hours * 3600 - minutes * 60;
  return hours > 0
    ? `${String(hours)}:${padding(minutes)}:${padding(seconds)}`
    : `${String(minutes)}:${padding(seconds)}`;
};

export const TwoWayAlert = (
  title: string,
  message: string,
  onSubmit: () => void,
  cancelText = 'Cancel',
  okText = 'OK'
) => {
  Alert.alert(title, message, [
    {
      text: cancelText,
      onPress: () => void 0,
      style: 'cancel',
    },
    {
      text: okText,
      onPress: onSubmit,
    },
  ]);
};

export const OneWayAlert = (
  title: string,
  message: string,
  onPress: () => void,
  okText = 'OK'
) => {
  Alert.alert(title, message, [{ text: okText, onPress: onPress }], {
    cancelable: true,
    onDismiss: onPress,
  });
};

export function randomChoice(list: Array<any>) {
  return list[Math.floor(Math.random() * list.length) >> 0];
}

export const rgb2rgba = (rgb: string, a = 1) => {
  const extractedRGB = [...rgb.matchAll(/(\d+)/g)];
  return `rgba(${extractedRGB[0][0]}, ${extractedRGB[1][0]}, ${extractedRGB[2][0]}, ${a})`;
};

export const getUniqObjects = (
  objects: Array<any>,
  property: (object: any) => any
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
export const chunkArray = (arr: Array<any>, size: number): Array<any[]> => {
  return arr.reduce((chunks, item, index) => {
    const chunkIndex = Math.floor(index / size);
    if (!chunks[chunkIndex]) {
      chunks[chunkIndex] = [];
    }
    chunks[chunkIndex].push(item);
    return chunks;
  }, []);
};
