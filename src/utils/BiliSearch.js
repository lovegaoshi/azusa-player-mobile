import {
  getSongList,
  getFavList,
  getBiliSeriesList,
  getBiliColleList,
  getBiliChannelList,
  getBilSearchList,
  getSongListFromAudio,
  getYoutubeVideo,
} from './DataProcess';

const extractBiliSeries = ({
  reExtracted,
  progressEmitter,
  favList,
  useBiliTag,
}) =>
  getBiliSeriesList({
    mid: reExtracted[1],
    sid: reExtracted[2],
    progressEmitter,
    favList,
    useBiliTag,
  });

const extractBiliColle = ({
  reExtracted,
  progressEmitter,
  favList,
  useBiliTag,
}) =>
  getBiliColleList({
    mid: reExtracted[1],
    sid: reExtracted[2],
    progressEmitter,
    favList,
    useBiliTag,
  });

const extractBiliChannel = ({
  reExtracted,
  progressEmitter,
  favList,
  useBiliTag,
}) =>
  getBiliChannelList({
    url: reExtracted.input,
    progressEmitter,
    favList,
    useBiliTag,
  });

const extractBiliAudio = ({ reExtracted, progressEmitter, favList }) =>
  getSongListFromAudio({ bvid: reExtracted[1], progressEmitter, favList });

const extractBiliVideo = ({ reExtracted, useBiliTag }) =>
  getSongList({ bvid: reExtracted[1], useBiliTag });

const extractBiliFavList = ({
  reExtracted,
  progressEmitter,
  favList,
  useBiliTag,
}) =>
  getFavList({
    mid: reExtracted[1],
    progressEmitter,
    favList,
    useBiliTag,
  });

/**
 * assign the proper extractor based on the provided url. uses regex.
 * @param {string} url
 * @param {function} progressEmitter
 * @param {array} favList
 * @param {boolean} useBiliTag
 * @returns
 */
const reExtractSearch = async ({
  url,
  progressEmitter,
  favList,
  useBiliTag,
  fastSearch,
}) => {
  const reExtractions = [
    [
      /space.bilibili\.com\/(\d+)\/channel\/seriesdetail\?sid=(\d+)/,
      extractBiliSeries,
    ],
    [
      /space.bilibili\.com\/(\d+)\/channel\/collectiondetail\?sid=(\d+)/,
      extractBiliColle,
    ],
    [/space.bilibili\.com\/(\d+)\/video/, extractBiliChannel],
    [/bilibili.com\/audio\/au([^/?]+)/, extractBiliAudio],
    [/(BV[^/?]+)/, extractBiliVideo],
    [/.*bilibili\.com\/\d+\/favlist\?fid=(\d+)/, extractBiliFavList],
    [/.*bilibili\.com\/medialist\/detail\/ml(\d+)/, extractBiliFavList],
    [
      /youtu(?:.*\/v\/|.*v=|\.be\/)([A-Za-z0-9_-]{11})/,
      ({ reExtracted }) => getYoutubeVideo({ bvid: reExtracted[1] }),
    ],
  ];
  for (const reExtraction of reExtractions) {
    const reExtracted = reExtraction[0].exec(url);
    if (reExtracted !== null) {
      return await reExtraction[1]({
        reExtracted,
        progressEmitter,
        favList,
        useBiliTag,
      });
    }
  }
  return await getBilSearchList({ mid: url, progressEmitter, fastSearch });
};

/**
 * searches various types of supported bilibili url (BVid, collection, series, favlist) and
 * returns the serached result.
 * @param {object}  input  input, can be a biliseries list url, or bvid, or fid
 */
export const searchBiliURLs = async ({
  input,
  progressEmitter = () => void 0,
  favList = [],
  useBiliTag = false,
  fastSearch = false,
}) => {
  let results = [];
  try {
    results = await reExtractSearch({
      url: input,
      progressEmitter,
      favList,
      useBiliTag,
      fastSearch,
    });
  } catch (err) {
    console.warn(err);
  }
  progressEmitter(0);
  return results;
};
