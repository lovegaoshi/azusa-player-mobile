// TODO: migrate to TS.

import { fetchVideoTagPromise, fetchiliBVIDs } from './Data';
import Song, { setSongBiliShazamed } from '../objects/Song';

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
  progressEmitter = val => undefined
) => {
  const newSongList = songlist.map((song, index) => {
    if (song.biliShazamedName === undefined || forced) {
      return new Promise(resolve =>
        fetchVideoTagPromise({ bvid: song.bvid, cid: song.id, name: null })
          // getBiliShazamedSongname({ bvid: song.bvid, cid: song.id, name: null })
          .then(val => {
            progressEmitter((index / songlist.length) * 100);
            resolve(setSongBiliShazamed(song, val));
          })
      );
    }
    return song;
  });
  return await Promise.all(newSongList);
};

export const getBVIDList = async ({
  bvids,
  progressEmitter = val => undefined,
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
