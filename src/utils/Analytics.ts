import i18n from 'i18next';

interface SongOccurenceDict {
  [name: string]: number;
}

interface AnalyticsResult {
  bvid: Set<string>;
  totalCount: number;
  validShazamCount: number;
  invalidShazamCount: number;
  songOccurrence: SongOccurenceDict;
  songsSorted: [string, number][];
  songsUnique: Set<string>;
  songTop10: [string, number][];
}

/**
 * top 10 most common songs
 * # of songs with valid names vs just numbers
 * # of bvids / total
 * use mui-confirm with a provided content
 */
const playlistAnalysis = (favList: { songList: NoxMedia.Song[] }) => {
  const results: AnalyticsResult = {
    bvid: new Set(),
    totalCount: 0,
    validShazamCount: 0,
    invalidShazamCount: 0,
    songOccurrence: {},
    songsSorted: [],
    songsUnique: new Set(),
    songTop10: [],
  };
  for (let i = 0, n = favList.songList.length; i < n; i++) {
    const song = favList.songList[n - i - 1];
    results.bvid.add(song.bvid);
    results.totalCount += 1;
    if (Number.isNaN(Number(song.parsedName))) {
      results.songsUnique.add(song.parsedName);
      results.validShazamCount += 1;
      if (results.songOccurrence[song.parsedName] === undefined) {
        results.songOccurrence[song.parsedName] = 0;
      }
      results.songOccurrence[song.parsedName] += 1;
    } else {
      results.invalidShazamCount += 1;
    }
  }
  results.songsSorted = Object.entries(results.songOccurrence).sort(
    (a, b) => -(a[1] - b[1]),
  );
  results.songTop10 = results.songsSorted.slice(0, 10);
  return results;
};

// TODO: add i18n as i18n.t('PlaylistOperations.searchListName')
export default (playlist: NoxMedia.Playlist, topX = 5) => {
  const analytics = playlistAnalysis(playlist);
  return {
    title: i18n.t('PlaylistAnalytics.title', { val: playlist.title }),
    content: [
      i18n.t('PlaylistAnalytics.uniqCount', {
        val: analytics.songsUnique.size,
      }),
      i18n.t('PlaylistAnalytics.topX', {
        val: analytics.songTop10
          .slice(0, topX)
          .map(val => `${val[0]} (${String(val[1])})`)
          .join(', '),
      }),
      i18n.t('PlaylistAnalytics.new', {
        val: Array.from(analytics.songsUnique)
          .slice(topX * -1)
          .reverse()
          .join(', '),
      }),
      i18n.t('PlaylistAnalytics.avg', {
        val1: String(analytics.bvid.size),
        val2: (analytics.totalCount / analytics.bvid.size).toFixed(1),
      }),
      i18n.t('PlaylistAnalytics.shazamFailed', {
        val1: `${String(analytics.invalidShazamCount)}/${String(
          analytics.totalCount,
        )}`,
        val2: (
          (analytics.invalidShazamCount * 100) /
          analytics.totalCount
        ).toFixed(1),
      }),
    ],
  };
};
