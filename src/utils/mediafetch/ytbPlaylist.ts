import { fetchYtmPlaylist } from './ytbPlaylist.muse';
import { fetchYtbiPlaylist } from './ytbPlaylist.ytbi';

const regexFetch = async ({
  reExtracted,
  favList = [],
}: NoxNetwork.RegexFetchProps): Promise<NoxNetwork.NoxRegexFetch> => {
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
    return { songList: await fetchYtbiPlaylist(reExtracted[1], favList) };
  }
};

export default {
  regexSearchMatch: /youtu.*list=([^&]+)/,
  regexFetch,
};
