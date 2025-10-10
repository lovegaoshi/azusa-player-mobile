import logger from '../Logger';
import { fetchYtmPlaylist } from './ytbPlaylist.muse';
import { fetchYtbiPlaylist } from './ytbPlaylist.ytbi';

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
    const results = await fetchYtmPlaylist(
      // fetchYTPlaylist(
      reExtracted[1],
      // progressEmitter,
      favList,
    );
    if (results.length === 0) {
      throw new Error(`ytm failed to resolve ${reExtracted[1]}`);
    }
    return { songList: results };
  } catch {
    return {
      songList: await fetchYtbiPlaylist({
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
