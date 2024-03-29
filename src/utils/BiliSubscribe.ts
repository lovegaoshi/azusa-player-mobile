import { searchBiliURLs } from './BiliSearch';
import { PLAYLIST_ENUMS } from '../enums/Playlist';
import { parseSongName } from '@stores/appStore';

interface Props {
  playlist: NoxMedia.Playlist;
  subscribeUrls?: Array<string>;
  updatePlaylist: (
    playlist: NoxMedia.Playlist,
    addSongs: NoxMedia.Song[],
    removeSongs: NoxMedia.Song[]
  ) => void;
  progressEmitter?: (val: number) => void;
  overwriteOnRefresh?: () => boolean;
  callback?: (newPlaylist: NoxMedia.Playlist) => void;
}
export const updateSubscribeFavList = async ({
  playlist,
  subscribeUrls,
  updatePlaylist,
  progressEmitter = () => undefined,
  overwriteOnRefresh = () =>
    playlist.newSongOverwrite || playlist.title.includes('live'),
  callback = () => undefined,
}: Props): Promise<NoxMedia.Playlist> => {
  let newPlaylist = { ...playlist, lastSubscribed: new Date().getTime() };
  if ([PLAYLIST_ENUMS.TYPE_FAVORI_PLAYLIST].includes(playlist.type))
    throw new Error('[biliSubscribe] incorrect playlist type for subscription');
  if (playlist.type === PLAYLIST_ENUMS.TYPE_SEARCH_PLAYLIST) {
    if (!playlist.refresh)
      throw new Error('[biliSubscribe] nothing to subscribe');
    newPlaylist = { ...newPlaylist, ...(await playlist.refresh(newPlaylist)) };
    newPlaylist.songList = newPlaylist.songList.concat(playlist.songList);
  } else {
    if (subscribeUrls === undefined) {
      subscribeUrls = newPlaylist.subscribeUrl;
    }
    if (subscribeUrls.length === 0 || subscribeUrls[0].length === 0) {
      throw new Error('[biliSubscribe] nothing to subscribe');
    }
    const favList = [
      ...newPlaylist.songList.map(val => val.bvid),
      ...newPlaylist.blacklistedUrl,
    ];
    for (const subscribeUrl of subscribeUrls) {
      newPlaylist.songList = (
        await searchBiliURLs({
          input: subscribeUrl,
          favList,
          useBiliTag: newPlaylist.useBiliShazam,
          progressEmitter,
        })
      ).songList.concat(newPlaylist.songList);
    }
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
  callback(newPlaylist);
  return newPlaylist;
};
