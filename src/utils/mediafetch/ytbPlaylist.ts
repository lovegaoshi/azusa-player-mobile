import logger from '../Logger';
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
  return {
    songList: await fetchYtbiPlaylist({
      playlistId: reExtracted[1],
      favList,
      limit: Number.isNaN(limit) ? Infinity : limit,
      getall,
    }),
  };
};

export default {
  regexSearchMatch: /youtu.*list=([^&]+).*/,
  regexFetch,
};
