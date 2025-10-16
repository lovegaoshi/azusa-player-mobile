import NativeNoxModule from '@specs/NativeNoxModule';
import { isAndroid } from '@utils/RNUtils';

export const getPoT = async (videoId: string) => {
  if (!isAndroid) return;
  return NativeNoxModule?.getPOToken(videoId)?.streamingDataPoToken;
};
