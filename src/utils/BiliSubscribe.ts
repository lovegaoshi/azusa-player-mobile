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
}
export const updateSubscribeFavList = async ({
  listObj,
  subscribeUrls,
  updatePlaylist,
  progressEmitter = () => undefined,
}: Props) => {
  try {
    // eslint-disable-next-line prefer-const
    let newPlaylist = { ...listObj, lastSubscribed: new Date().getTime() };
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
    const uniqueSongList = newPlaylist.songList.reduce(
      (arr, curr) => arr.set(curr.id, curr),
      new Map<string, NoxMedia.Song>()
    );
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
