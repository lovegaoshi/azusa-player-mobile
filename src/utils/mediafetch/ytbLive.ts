import ytbVideoFetch from '@utils/mediafetch/ytbvideo';
import logger from '../Logger';

const regexFetch = async ({
  reExtracted,
}: NoxNetwork.RegexFetchProps): Promise<NoxNetwork.NoxRegexFetch> => {
  const audioInfo = await ytbVideoFetch.regexFetch({ reExtracted });
  if (audioInfo.songList.length === 0) {
    logger.warn(
      `[ytblive] fetch failed on ${reExtracted[0]} assuming its a video`,
      // TODO: resolve streaming url here
    );
  }
  return audioInfo;
};

export default {
  //https://www.youtube.com/live/v2gYvMIc_XI
  regexSearchMatch: /youtu.*\/live\/([A-Za-z0-9_-]{11})/,
  regexFetch,
};
