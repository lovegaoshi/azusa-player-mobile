import { searchBiliURLs } from './BiliSearch';
import { parseSongName } from './re';

interface props {
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
  progressEmitter = () => void 0,
}: props) => {
  try {
    const oldListLength = listObj.songList.length;
    // eslint-disable-next-line prefer-const
    let newPlaylist = { ...listObj, lastSubscribed: new Date().getTime() };
    if (subscribeUrls === undefined) {
      subscribeUrls = newPlaylist.subscribeUrl;
    }
    if (subscribeUrls.length === 0 || subscribeUrls[0].length === 0)
      return null;
    // TODO: this is stupid. needs to change:
    // 1. set the unique map first with newPlaylist, then
    // in loop set new stuff into it, instead of concat lists
    // 2. order this correctly. this for loop needs to be reversed
    for (let i = 0, n = subscribeUrls.length; i < n; i++) {
      newPlaylist.songList = (
        await searchBiliURLs({
          input: subscribeUrls[i],
          favList: [
            ...newPlaylist.songList.map(val => val.bvid),
            ...newPlaylist.blacklistedUrl,
          ],
          useBiliTag: newPlaylist.useBiliShazam,
          progressEmitter,
        })
      ).concat(newPlaylist.songList);
    }
    const uniqueSongList = new Map();
    newPlaylist.songList.forEach(tag => uniqueSongList.set(tag.id, tag));
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
