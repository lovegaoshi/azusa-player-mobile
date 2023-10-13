import { searchBiliURLs } from './BiliSearch';
import { parseSongName } from '@stores/appStore';

interface Props {
  listObj: NoxMedia.Playlist;
  subscribeUrls?: Array<string>;
  updatePlaylist: (
    playlist: NoxMedia.Playlist,
    addSongs: NoxMedia.Song[],
    removeSongs: NoxMedia.Song[]
  ) => void;
  progressEmitter: (val: number) => void;
  overwriteOnRefresh?: () => boolean;
}
export const updateSubscribeFavList = async ({
  listObj,
  subscribeUrls,
  updatePlaylist,
  progressEmitter = () => undefined,
  overwriteOnRefresh = () => listObj.newSongOverwrite || listObj.title.includes('live'),
}: Props) => {
  try {
    const newPlaylist = { ...listObj, lastSubscribed: new Date().getTime() };
    if (subscribeUrls === undefined) {
      subscribeUrls = newPlaylist.subscribeUrl;
    }
    if (subscribeUrls.length === 0 || subscribeUrls[0].length === 0) {
      return null;
    }
    const favList = [
      ...newPlaylist.songList.map(val => val.bvid),
      ...newPlaylist.blacklistedUrl,
    ];
    for (let i = 0, n = subscribeUrls.length; i < n; i++) {
      newPlaylist.songList = (
        await searchBiliURLs({
          input: subscribeUrls[i],
          favList,
          useBiliTag: newPlaylist.useBiliShazam,
          progressEmitter,
        })
      ).concat(newPlaylist.songList);
    }
    const uniqueSongList = new Map<string, NoxMedia.Song>();
    if (overwriteOnRefresh()) {
      newPlaylist.songList.forEach(song => {
        if (!uniqueSongList.has(song.id)) {
          uniqueSongList.set(song.id, song);
        }
      });
    } else {
      newPlaylist.songList.forEach(song => {
        uniqueSongList.set(song.id, song);
      });
    }
    newPlaylist.songList = [...uniqueSongList.values()].map(val =>
      parseSongName(val)
    );
    // This sounds like a performance disaster
    // as currentPlaylist will be changed,
    // but flashlist seems too performant to care.
    // MOCK: GeT a BeTtEr PhOnE
    // TODO: revert lastSubscribed to a dedicated playerSettings field
    // like noxplayer did, instead of being a playlist field
    updatePlaylist(newPlaylist, [], []);
    return newPlaylist.songList;
  } catch (err) {
    console.warn(err);
    return null;
  }
};
