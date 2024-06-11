import fetcher, {
  fetchVideoPlayUrlPromise,
} from '../../src/utils/mediafetch/bilivideo';
test('bilivideo', async () => {
  const content = await fetcher.regexFetch({
    reExtracted: fetcher.regexSearchMatch.exec(
      'https://www.bilibili.com/video/BV1cK42187AE/'
    )!,
  });
  // console.log(content);
  expect(content?.songList[0]?.id).not.toBeNull();

  const playurl = await fetchVideoPlayUrlPromise({ bvid: 'BV1cK42187AE' });
  // console.log(playurl);

  expect(playurl.url).not.toBeNull();
});
