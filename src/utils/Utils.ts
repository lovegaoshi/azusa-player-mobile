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

export const notNullDefault = (val: any, defaultVal: any) => {
  if (val) return val;
  return defaultVal;
};

export const twoWayAlert = (
  title: string,
  message: string,
  onSubmit: () => void
) => {
  Alert.alert(title, message, [
    {
      text: 'Cancel',
      onPress: () => void 0,
      style: 'cancel',
    },
    {
      text: 'OK',
      onPress: onSubmit,
    },
  ]);
};
