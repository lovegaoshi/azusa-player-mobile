/**
 * refactor:
 * bilisearch workflow:
 * reExtractSearch matches regex patterns and use the corresponding fetch functions;
 * fetch function takes extracted and calls a dataProcess.js fetch function;
 * dataprocess fetch function fetches VIDEOINFO using data.js fetch function, then parses into SONGS
 * data.js fetch function fetches VIDEOINFO.
 * steps to refactor:
 * each site needs a fetch to parse regex extracted, a videoinfo fetcher and a song fetcher.
 */
import { regexFetchProps } from './generic';
import { fetchAwaitPaginatedAPI } from './paginatedfetch';
import SongTS from '@objects/Song';

const pagesize = 500;

const VIDEOINFO_API = `https://steria.vplayer.tk/api/musics/{pn}?size=${pagesize}`;
// https://steria.vplayer.tk/api/musics/1
const CIDPREFIX = 'steriatk-';

const paginatedFetch = ({
  progressEmitter,
  favList = [],
}: Partial<regexFetchProps>) => {
  return fetchAwaitPaginatedAPI({
    url: VIDEOINFO_API,
    getMediaCount: json => json.total,
    getPageSize: () => pagesize,
    getItems: json => json.data,
    resolveBiliBVID: async BVobjs =>
      BVobjs.map(videoinfo =>
        SongTS({
          cid: `${CIDPREFIX}${videoinfo.url}`,
          bvid: `${CIDPREFIX}${videoinfo.id}`,
          name: videoinfo.name,
          nameRaw: videoinfo.name,
          singer: videoinfo.artist,
          singerId: 'steria.vplayer.tk',
          cover:
            'https://i2.hdslb.com/bfs/face/b70f6e62e4582d4fa5d48d86047e64eb57d7504e.jpg',
          lyric: '',
          page: 0,
          duration: 0,
          album: videoinfo.name,
          source: NoxEnumMediaFetch.Source.Steriatk,
        })
      ),
    progressEmitter,
    favList,
    getBVID: item => `${CIDPREFIX}${item.id}`,
    getJSONData: val => val,
  });
};

const regexFetch = async ({
  progressEmitter,
  favList,
}: Partial<regexFetchProps>): Promise<NoxNetwork.NoxRegexFetch> => ({
  songList: await paginatedFetch({ progressEmitter, favList }),
});

const resolveURL = async (song: NoxMedia.Song) => {
  return { url: song.id.slice(9) };
};

const refreshSong = (song: NoxMedia.Song) => song;

export default {
  regexSearchMatch: /steria.vplayer.tk/,
  regexSearchMatch2: /Steria.vplayer.tk/,
  regexFetch,
  regexResolveURLMatch: /^steriatk-/,
  resolveURL,
  refreshSong,
};
