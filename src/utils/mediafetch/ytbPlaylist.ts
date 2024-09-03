import { fetchYtmPlaylist } from './ytbPlaylist.muse';
import { fetchYtbiPlaylist } from './ytbPlaylist.ytbi';

const regexFetch = async ({
  reExtracted,
  favList = [],
}: NoxNetwork.RegexFetchProps): Promise<NoxNetwork.NoxRegexFetch> => {
  const results = await fetchYtmPlaylist(
    // fetchYTPlaylist(
    reExtracted[1],
    // progressEmitter,
    favList
  );
  if (results.length === 0) {
    return { songList: await fetchYtbiPlaylist(reExtracted[1], favList) };
  }
  return { songList: results };
};

export default {
  regexSearchMatch: /youtu.*list=([^&]+)/,
  regexFetch,
};
