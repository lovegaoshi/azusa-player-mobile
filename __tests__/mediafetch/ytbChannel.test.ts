// GMHikaru
import fetcher from '../../src/utils/mediafetch/ytbChannel.ytbi';
test('YT channel', async () => {
  // HACK: due to yti limiatations this only gets up to 30 videos
  const result = await fetcher.regexFetch({
    reExtracted: fetcher.regexSearchMatch.exec(
      'https://www.youtube.com/c/@MioriCelesta'
    )!,
  });
  expect(result.songList[0]?.id).not.toBeUndefined();
});
