interface SongOccurenceDict {
  [name: string]: number;
}

interface AnalyticsResult {
  bvid: Set<string>;
  totalCount: number;
  validShazamCount: number;
  invalidShazamCount: number;
  songOccurrence: SongOccurenceDict;
  songsSorted: Array<[string, number]>;
  songsUnique: Set<string>;
  songTop10: Array<[string, number]>;
}

/**
 * top 10 most common songs
 * # of songs with valid names vs just numbers
 * # of bvids / total
 * use mui-confirm with a provided content
 * @param {*} favList
 */
const playlistAnalysis = (favList: { songList: Array<NoxMedia.Song> }) => {
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
    (a, b) => -(a[1] - b[1])
  );
  results.songTop10 = results.songsSorted.slice(0, 10);
  return results;
};

// TODO: once i18n is added we have to use as a hook. right now looks dumb.
const useAnalytics = () => {
  const playlistAnalyze = (playlist: NoxMedia.Playlist, topX = 5) => {
    const analytics = playlistAnalysis(playlist);
    return {
      title: `歌单 ${playlist.title} 的统计信息`,
      content: [
        `歌单内总共有${analytics.songsUnique.size}首独特的歌`,
        `歌单内最常出现的歌：${analytics.songTop10
          .slice(0, topX)
          .map(val => `${val[0]} (${String(val[1])})`)
          .join(', ')}`,
        `最近的新歌：${Array.from(analytics.songsUnique)
          .slice(topX * -1)
          .reverse()
          .join(', ')}`,
        `bv号总共有${String(analytics.bvid.size)}个，平均每bv号有${(
          analytics.totalCount / analytics.bvid.size
        ).toFixed(1)}首歌`,
        `shazam失败的歌数: ${String(analytics.invalidShazamCount)}/${String(
          analytics.totalCount
        )} (${(
          (analytics.invalidShazamCount * 100) /
          analytics.totalCount
        ).toFixed(1)}%)`,
      ],
    };
  };
  return { playlistAnalyze };
};

export default useAnalytics;
