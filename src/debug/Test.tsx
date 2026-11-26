import { useEffect } from 'react';

import ytClient from '@utils/mediafetch/ytbi';
import { getPoT } from '@utils/mediafetch/ytpot';

const VideoID = 'VtXTFi8edyE';

const testYTBVideo = async () => {
  const yt = await ytClient();
  const pot = await getPoT(VideoID);
  const iosHLS = await yt.getShortsVideoInfo(VideoID, 'IOS');
  const extractedVideoInfo = await yt.getBasicInfo(VideoID, {
    client: 'VISIONOS',
  });
  console.log('[yt.js] debugging', {
    pot,
    iosHLS,
    extractedVideoInfo,
  });
};

export default () => {
  useEffect(() => {
    testYTBVideo();
  }, []);
  return <></>;
};
