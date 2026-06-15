import logger from '../Logger';
import { fetchYtbiPlaylist } from './ytbPlaylist.ytbi';
import { fetchYTPlaylist as fetchYTWebPlaylist } from './ytbPlaylist.muse';

const regexFetch = async ({
  reExtracted,
  favList = [],
}: NoxNetwork.RegexFetchProps): Promise<NoxNetwork.NoxRegexFetch> => {
  const searchParams = Object.fromEntries(
    new URL('https://www.' + reExtracted[0]).searchParams,
  );
  const limit = Number(searchParams.limit);
  const getall = searchParams.getall !== undefined;
  logger.debug(`[ytbPlaylist] extracting playlist ${reExtracted[1]}`);
  try {
    const songList = await fetchYtbiPlaylist({
      playlistId: reExtracted[1],
      favList,
    });
    if (songList.length === 0) {
      logger.warn(`[ytbiPlaylist] playlist ${reExtracted[1]} is empty`);
      throw new Error('ytbi failed to extract');
    }
    return { songList };
  } catch {
    return {
      songList: await fetchYTWebPlaylist({
        playlistId: reExtracted[1],
        favList,
        limit: Number.isNaN(limit) ? Infinity : limit,
        getall,
      }),
    };
  }
};

export default {
  regexSearchMatch: /youtu.*list=([^&]+).*/,
  regexFetch,
};
