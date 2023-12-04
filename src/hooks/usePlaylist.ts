import useAnalytics from '../utils/Analytics';
import { getPlaylistUniqBVIDs } from '../objects/Playlist';
import {
  fetchVideoInfo,
  songFetch,
  fetchiliBVIDs,
} from '../utils/mediafetch/bilivideo';
import { biliShazamOnSonglist } from '../utils/mediafetch/bilishazam';
import { useNoxSetting } from '../stores/useApp';
import { syncFavlist } from '../utils/Bilibili/bilifavOperate';

/**
 * performs all common playlist operations (within a playlist).
 */
export default () => {
  const { playlistAnalyze } = useAnalytics();
  const currentPlaylist = useNoxSetting(state => state.currentPlaylist);
  const updatePlaylist = useNoxSetting(state => state.updatePlaylist);
  const progressEmitter = useNoxSetting(
    state => state.searchBarProgressEmitter
  );

  const playlistCleanup = async (playlist = currentPlaylist) => {
    progressEmitter(100);
    const promises: Promise<void>[] = [];
    const validBVIds: Array<string> = [];
    getPlaylistUniqBVIDs(playlist).forEach(bvid =>
      promises.push(
        fetchVideoInfo(bvid).then(val => {
          if (val) validBVIds.push(val.bvid);
        })
      )
    );
    await Promise.all(promises);
    updatePlaylist(
      {
        ...playlist,
        songList: playlist.songList.filter(song =>
          validBVIds.includes(song.bvid)
        ),
      },
      [],
      []
    );
    progressEmitter(0);
  };

  const playlistBiliShazam = async (playlist = currentPlaylist) => {
    progressEmitter(100);
    const newSongList = await biliShazamOnSonglist(
      playlist.songList,
      false,
      progressEmitter
    );
    updatePlaylist(
      {
        ...playlist,
        songList: newSongList,
      },
      [],
      []
    );
    progressEmitter(0);
  };

  const playlistReload = async (playlist = currentPlaylist) => {
    const newSongList = await songFetch({
      videoinfos: await fetchiliBVIDs(
        getPlaylistUniqBVIDs(playlist),
        progressEmitter
      ), // await fetchiliBVID([reExtracted[1]!])
      useBiliTag: playlist.useBiliShazam || false,
    });
    updatePlaylist(
      {
        ...playlist,
        songList: newSongList!,
      },
      [],
      []
    );
  };

  const playlistClear = (playlist = currentPlaylist) =>
    updatePlaylist(
      {
        ...playlist,
        songList: [],
      },
      [],
      []
    );

  const playlistSync2Bilibili = async (playlist = currentPlaylist) => {
    await syncFavlist(playlist, progressEmitter);
    progressEmitter(0);
  };

  return {
    playlistAnalyze,
    playlistCleanup,
    playlistBiliShazam,
    playlistReload,
    playlistClear,
    playlistSync2Bilibili,
  };
};
