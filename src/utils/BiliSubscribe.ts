import { searchBiliURLs } from './BiliSearch';
import { PlaylistTypes } from '../enums/Playlist';
import { parseSongName } from '@stores/appStore';
import logger from './Logger';

interface Props {
  playlist: NoxMedia.Playlist;
  subscribeUrls?: string[];
  updatePlaylist: (
    playlist: NoxMedia.Playlist,
    addSongs: NoxMedia.Song[],
    removeSongs: NoxMedia.Song[]
  ) => void;
  progressEmitter?: NoxUtils.ProgressEmitter;
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
}: Props): Promise<NoxMedia.Playlist | undefined> => {
  let newPlaylist = { ...playlist, lastSubscribed: new Date().getTime() };
  if ([PlaylistTypes.Favorite].includes(playlist.type)) {
    logger.warn('[biliSubscribe] incorrect playlist type for subscription');
    return;
  }
  if (playlist.type === PlaylistTypes.Search) {
    if (!playlist.refresh) {
      // HACK: disabling error throwing at this point.
      logger.debug('[biliSubscribe] nothing to subscribe');
      return;
    }
    newPlaylist = { ...newPlaylist, ...(await playlist.refresh(newPlaylist)) };
    newPlaylist.songList = newPlaylist.songList.concat(playlist.songList);
  } else {
    if (subscribeUrls === undefined) {
      subscribeUrls = newPlaylist.subscribeUrl;
    }
    if (subscribeUrls.length === 0 || subscribeUrls[0].length === 0) {
      logger.debug('[biliSubscribe] nothing to subscribe');
      return;
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
