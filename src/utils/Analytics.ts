import Song from '../objects/SongInterface';

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
export default (favList: { songList: Array<Song> }) => {
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
