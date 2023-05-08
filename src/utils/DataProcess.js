// TODO: migrate to TS.

import {
  fetchVideoInfo,
  fetchPlayUrlPromise,
  fetchFavList,
  fetchBiliSeriesList,
  fetchBiliColleList,
  fetchBiliChannelList,
  fetchBiliSearchList,
  fetchAudioInfoRaw as fetchAudioInfo,
  fetchVideoTagPromise,
  fetchiliBVIDs,
  ENUMS,
} from './Data';
import Song, { setSongBiliShazamed } from '../objects/SongOperations';

const DEFAULT_BVID = 'BV1g34y1r71w';
const LAST_PLAY_LIST = 'LastPlayList';

/**
 * uses the bilibili tag API to acquire bilibili shazamed results to a video.
 * @param {string} bvid must provide.
 * @param {string} name must provide.
 * @param {string} cid must provide.
 * @returns
 */
export const getBiliShazamedSongname = async info => {
  return fetchVideoTagPromise({
    bvid: info.bvid,
    cid: info.cid,
    name: info.name,
  });
};

/**
 * uses the bilibili tag API to acquire bilibili shazamed results to a list of videos.
 * @param {Array} songlist
 * @param {boolean} forced
 * @returns
 */
export const biliShazamOnSonglist = async (
  songlist,
  forced = false,
  progressEmitter = val => void 0
) => {
  const newSongList = songlist.map((song, index) => {
    if (song.biliShazamedName === undefined || forced) {
      return new Promise(resolve =>
        fetchVideoTagPromise({ bvid: song.bvid, cid: song.id, name: null })
          // getBiliShazamedSongname({ bvid: song.bvid, cid: song.id, name: null })
          .then(val => {
            progressEmitter(index / songlist.length);
            resolve(setSongBiliShazamed(song, val));
          })
      );
    }
    return song;
  });
  return await Promise.all(newSongList);
};

export const getSongList = async ({ bvid, useBiliTag = false }) => {
  const info = await fetchVideoInfo(bvid);
  const lrc = '';
  let songs = [];

  // Case of single part video
  if (info.pages.length === 1) {
    // lrc = await fetchLRC(info.title)
    return [
      Song({
        cid: info.pages[0].cid,
        bvid,
        name: info.title,
        singer: info.uploader.name,
        singerId: info.uploader.mid,
        cover: info.picSrc,
        lyric: lrc,
        page: 1,
        duration: info.duration,
      }),
    ];
  }

  // Can't use forEach, does not support await
  for (let index = 0; index < info.pages.length; index++) {
    const page = info.pages[index];
    // lrc = fetchLRC(page.part)
    songs.push(
      Song({
        cid: page.cid,
        bvid,
        name: page.part,
        singer: info.uploader.name,
        singerId: info.uploader.mid,
        cover: info.picSrc,
        lyric: lrc,
        page: index + 1,
        duration: page.duration,
      })
    );
  }
  if (useBiliTag) songs = await biliShazamOnSonglist(songs);
  return songs;
};

export const getSongListFromAudio = async ({ bvid }) => {
  const info = await fetchAudioInfo(bvid);
  const lrc = '';
  const songs = [];

  // Case of single part video
  if (info.pages.length === 1) {
    // lrc = await fetchLRC(info.title)
    return [
      Song({
        cid: `${info.pages[0].cid}-${bvid}`,
        bvid,
        name: info.title,
        singer: info.uploader.name,
        singerId: info.uploader.mid,
        cover: info.picSrc,
        lyric: lrc,
        page: 1,
        duration: info.duration,
      }),
    ];
  }

  // Can't use forEach, does not support await
  for (let index = 0; index < info.pages.length; index++) {
    const page = info.pages[index];
    // lrc = fetchLRC(page.part)
    songs.push(
      Song({
        cid: `${page.cid}-${bvid}`,
        bvid,
        name: page.part,
        singer: info.uploader.name,
        singerId: info.uploader.mid,
        cover: info.picSrc,
        lyric: lrc,
        page: index + 1,
        duration: page.duration,
      })
    );
  }

  return songs;
};

export const getSongsFromBVids = async ({ infos, useBiliTag = false }) => {
  let songs = [];
  for (const info of infos) {
    if (!info) {
      return;
    }
    // Case of single part video
    if (info.pages.length === 1) {
      // lrc = await fetchLRC(info.title)
      songs.push(
        Song({
          cid: info.pages[0].cid,
          bvid: info.pages[0].bvid,
          // this is stupidly slow because each of this async has to be awaited in a sync constructor?!
          name: info.title,
          singer: info.uploader.name,
          singerId: info.uploader.mid,
          cover: info.picSrc,
          page: 1,
          duration: info.duration,
        })
      );
    } else {
      // Can't use forEach, does not support await
      for (let index = 0; index < info.pages.length; index++) {
        const page = info.pages[index];
        // lrc = fetchLRC(page.part)
        songs.push(
          Song({
            cid: page.cid,
            bvid: page.bvid,
            name: page.part,
            singer: info.uploader.name,
            singerId: info.uploader.mid,
            cover: info.picSrc,
            page: index + 1,
            duration: page.duration,
          })
        );
      }
    }
  }
  if (useBiliTag) songs = await biliShazamOnSonglist(songs);
  return songs;
};

export const getSongsFromSteriaPlayer = async infos => {
  // https://steria.vplayer.tk/api/musics/1
  const songs = [];

  infos.forEach(info => {
    if (!info) {
      return;
    }
    // Case of single part video
    for (let index = 0, n = info.data.length; index < n; index++) {
      songs.push(
        Song({
          cid: info.data[index].id,
          bvid: info.data[index].id,
          name: info.data[index].name,
          singer: info.data[index].artist,
          singerId: info.data[index].artist,
          cover:
            'https://i2.hdslb.com/bfs/face/b70f6e62e4582d4fa5d48d86047e64eb57d7504e.jpg@240w_240h_1c_1s.webp',
          duration: 0,
        })
      );
    }
  });

  return songs;
};

export const getBiliSeriesList = async ({
  mid,
  sid,
  progressEmitter = () => void 0,
  favList = [],
  useBiliTag = false,
}) => {
  return getSongsFromBVids({
    infos: await fetchBiliSeriesList(mid, sid, progressEmitter, favList),
    useBiliTag,
  });
};

export const getFavList = async ({
  mid,
  progressEmitter = () => void 0,
  favList = [],
  useBiliTag = false,
}) => {
  return getSongsFromBVids({
    infos: await fetchFavList(mid, progressEmitter, favList),
    useBiliTag,
  });
};

export const getBiliColleList = async ({
  mid,
  sid,
  progressEmitter = () => void 0,
  favList = [],
  useBiliTag = false,
}) => {
  return getSongsFromBVids({
    infos: await fetchBiliColleList(mid, sid, progressEmitter, favList),
    useBiliTag,
  });
};

export const getBiliChannelList = async ({
  url,
  progressEmitter = () => void 0,
  favList = [],
  useBiliTag = false,
}) => {
  return getSongsFromBVids({
    infos: await fetchBiliChannelList(url, progressEmitter, favList),
    useBiliTag,
  });
};

export const getBilSearchList = async ({
  mid,
  progressEmitter = () => void 0,
  useBiliTag = false,
}) => {
  return getSongsFromBVids({
    infos: await fetchBiliSearchList(mid, progressEmitter),
    useBiliTag,
  });
};

export const getBVIDList = async ({
  bvids,
  progressEmitter = val => void 0,
  favList = [],
  useBiliTag = false,
}) => {
  const songs = getSongsFromBVids({
    infos: await fetchiliBVIDs(bvids, progressEmitter, favList),
    useBiliTag,
  });
  progressEmitter(0);
  return songs;
};
