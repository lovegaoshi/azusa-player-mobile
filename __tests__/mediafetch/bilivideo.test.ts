import fetcher, {
  fetchVideoPlayUrlPromise,
} from '../../src/utils/mediafetch/bilivideo';
test('bilivideo', async () => {
  const content = await fetcher.regexFetch({
    reExtracted: fetcher.regexSearchMatch.exec(
      'https://www.bilibili.com/video/BV1WJ4m1H7XT'
    )!,
  });
  // console.log(content);
  expect(content?.songList[0]?.id).not.toBeNull();

  const playurl = await fetchVideoPlayUrlPromise({ bvid: 'BV1WJ4m1H7XT' });
  // console.log(playurl);

  expect(playurl.url).not.toBeNull();
});
