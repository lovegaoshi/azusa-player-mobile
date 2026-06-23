// GMHikaru
import fetcher from '../../src/utils/mediafetch/ytbChannel.ytbi';
test('YT channel', async () => {
  // HACK: due to yti limiatations this only gets up to 30 videos
  const result = await fetcher.regexFetch({
    reExtracted: fetcher.regexSearchMatch.exec(
      'https://www.youtube.com/c/@MioriCelesta',
    )!,
  });
  console.log(result.songList.length);
  expect(result.songList[0]?.id).not.toBeUndefined();
});

/**

const { Innertube, ClientType, Platform } = await import("youtubei.js");
const yt = await Innertube.create({
    retrieve_player: false,
    enable_session_cache: false,
    generate_session_locally: false});

res = await yt.getChannel('UCyKsg-57XC9pyHbP7v3kCPQ')
 
 */
